# Tiny Webpack Userscript Plugin

> - Allows one to bundle userscripts, using webpack
> - It's one file: [TinyWebpackUserscriptPlugin.ts](./TinyWebpackUserscriptPlugin.ts)

## Usage

This could be your `webpack.config.ts`:

```ts
import { resolve } from 'path';
import { Configuration } from 'webpack';
import { TinyWebpackUserscriptPlugin, IMetaSchema } from 'tiny-webpack-userscript-plugin';

const buildDirectory = resolve(__dirname, './build');
const name = 'TestScript'
const meta: IMetaSchema = {
  name,
  author: 'jim',
  license: 'MIT',
  namespace: 'jim',
  version: '0.1.0',
  updateURL: `http://github.com/nfour/tiny-webpack-userscript-plugin/master/tree/test/build/${name}.user.js`,
  downloadURL: `http://github.com/nfour/tiny-webpack-userscript-plugin/master/tree/test/build/${name}.user.js`,
}

export default <Configuration> {
  mode: "development",
  entry: `./${name}.ts`,
  plugins: [
    new TinyWebpackUserscriptPlugin({
      meta,
      developmentUrl: 'http://localhost:9002',
      // default: false. If true, additional headers to appease OpenUserJS are appended
      appendOpenUserJSHeader: true,
    })
  ],
  output: {
    path: buildDirectory,
    filename: `${name}.user.js`
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [{
      test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/
    }]
  },
}

```

- See test project [./test/TinyWebpackUserscriptPlugin.test.ts](./test/TinyWebpackUserscriptPlugin.test.ts) for details.

## Development tips

To compile and serve your userscripts at, for at `http://localhost:9002/${scriptName}.user.js` create a npm script like this:

```json
{
  "scripts": {
    "dev": "concurrently 'yarn webpack --watch' 'yarn serve -l 9002 build'"   
  },
  "devDependencies": {
    "concurrently": "5.1",
    "serve": "11.3"
  }
}
```