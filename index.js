/**
 * 默认的监听选项
 * 目前只有指定服务的各种参数
 */
const defaultWatchOptions = {
  port: 9900,
  host: 'localhost',
  protocol: 'ws'
};

class KbsDslParserPlugin {
  constructor({
    compress = false,
    ignoreFNames = [],
    watch = false, // 是否监听
    watchOptions
  } = {}) {
    const wsOptions = Object.assign({}, defaultWatchOptions, watchOptions || {});
    Object.assign(this, {
      compress,
      ignoreFNames,
      watch,
      wsOptions,
      isUpdate: false, // 第一次完成编译不是更新
      send: () => {},
      jsFileHistory: {},
      dslStrMap: {}
    });
    if (watch) {
      // 生成 websocket 服务
      const WebSocketServer = require('ws').Server;
      const websocketServer = new WebSocketServer({ port: wsOptions.port });
      console.log('websocket服务创建成功!');
      websocketServer.on('connection', (ws) => {
        console.log('ws连接成功');
        this.send = (dslJson) => {
          ws.send(dslJson);
        }
        ws.on('close', () => {
          console.log('ws断开');
          this.send = () => {};
        });
      });
    }
  }
  apply(compiler) {
    compiler.hooks.afterCompile.tap('KbsDslParserPlugin', (compilation) => {
      Object.entries(compilation.assets).forEach(item => {
        const name = item[0];
        const asset = item[1];
        const isScript = (/\.js$/.test(name));
        if (!name || !isScript) return ;
        const entryName = name.replace(/\.[0-9a-z]{20}\.js$/i, '');
        if (this.jsFileHistory[entryName] === name) return; // 表示已经被标记
        this.jsFileHistory[entryName] = name;
        if (asset) {
          // 找到资源
          const realAsset = asset._children ? asset._children[1] : asset;
          const code = realAsset._cachedSource || realAsset._originalSourceAsString;
          if (code) {
            const ast = require("@babel/parser").parse(code);
            const dsl = require('./parser')(ast, this.compress, this.ignoreFNames);
            const dslStr = JSON.stringify(dsl);
            this.dslStrMap[entryName] = dslStr;
            const rowSource = new compiler.webpack.sources.RawSource(dslStr);
            compilation.emitAsset(`${name.replace(/\.js$/, '')}.dsl.json`, rowSource);
          }
        }
      });
    });
    if (this.watch) {
      compiler.hooks.done.tap('KbsDslParserPlugin', () => {
        if (this.isUpdate) {
          setTimeout(() => {
            Object.entries(this.dslStrMap).forEach(item => {
              const entry = item[0];
              const dslStr = item[1];
              console.log('更新文件：', entry);
              this.send(JSON.stringify({
                entry,
                dslStr
              }));
            });
            // 清空
            this.dslStrMap = {};
          }, 0);
        } else {
          this.isUpdate = true;
          this.dslStrMap = {};
        }
      });
    }
  }
}

module.exports = KbsDslParserPlugin;
