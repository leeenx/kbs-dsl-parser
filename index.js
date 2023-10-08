const { Compilation } = require('webpack');
class KbsDslParserPlugin {
  constructor({
    compress = false,
    ignoreFNames = []
  } = {}) {
    this.compress = compress;
    this.ignoreFNames = ignoreFNames;
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
        const rowSource = new compiler.webpack.sources.RawSource(JSON.stringify(dsl));
        compilation.emitAsset(`index.${compilation.hash}.dsl.json`, rowSource);
      }
    });
  }
}

module.exports = KbsDslParserPlugin;
