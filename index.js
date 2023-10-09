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
      send: () => {}
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
      const name = `index.${compilation.hash}`;
      const asset = compilation.assets[`${name}.js`];
      if (asset) {
        // 找到资源
        const realAsset = asset._children ? asset._children[1] : asset;
        const code = realAsset._cachedSource || realAsset._originalSourceAsString;
        const ast = require("@babel/parser").parse(code);
        const dsl = require('./parser')(ast, this.compress, this.ignoreFNames);
        this.dslStr = JSON.stringify(dsl);
        const rowSource = new compiler.webpack.sources.RawSource(this.dslStr);
        compilation.emitAsset(`index.${compilation.hash}.dsl.json`, rowSource);
      }
    });
    if (this.watch) {
      compiler.hooks.done.tap('KbsDslParserPlugin', () => {
        if (this.isUpdate) {
          setTimeout(() => {
            this.send(this.dslStr);
          }, 0);
        } else {
          this.isUpdate = true;
        }
      });
    }
  }
}

module.exports = KbsDslParserPlugin;
