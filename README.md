# Tiny Webpack Userscript Plugin

> - Allows one to bundle userscripts, using webpack
> - It's one file: [TinyWebpackUserscriptPlugin.ts](./TinyWebpackUserscriptPlugin.ts)

## Usage

> Check out the test project [./test/webpack.config.ts](./test/webpack.config.ts) for a full example!

This could be your `webpack.config`:

```ts
import { resolve } from 'path';
import { TinyWebpackUserscriptPlugin } from 'tiny-webpack-userscript-plugin';

const dir = (...paths: string[]) => resolve(__dirname, ...paths)

const scriptName = 'TestScript';

export default {
  mode: "development",
  entry: { [scriptName]: dir(`./${scriptName}.ts`) },
  plugins: [
    new TinyWebpackUserscriptPlugin({
      scriptName,
      headers: [
        {
          name: scriptName,
          author: 'jim',
          license: 'MIT',
          namespace: 'jim',
          version: '0.1.0',
          updateURL: `http://github.com/nfour/tiny-webpack-userscript-plugin/master/tree/test/build/${scriptName}.user.js`,
          downloadURL: `http://github.com/nfour/tiny-webpack-userscript-plugin/master/tree/test/build/${scriptName}.user.js`,
        }
      ],
      developmentUrl: 'http://localhost:9002',
    })
  ],
  output: {
    path: dir('./build'),
    filename: `[name].user.js`
  },
  resolve: { extensions: ['.ts', '.js', '.json'] },
  module: {
    rules: [{
      test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/
    }]
  },
};
```

> **Tip**: To produce **multiple scripts**, just export an array of webpack configs.


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