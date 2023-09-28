class KbsDslParserPlugin {
  constructor({
    compress = false,
    ignoreFNames = []
  } = {}) {
    super();
    this.compress = compress;
    this.ignoreFNames = ignoreFNames;
  }
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('KbsDslParserPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'MyPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL, // see below for more stages
        },
        (assets) => {
          console.log('List of assets and their sizes:');
          Object.entries(assets).forEach(([pathname, source]) => {
            console.log(`— ${pathname}: ${source.size()} bytes`);
          });
        }
      );
    });
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
