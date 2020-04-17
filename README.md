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
      // Optional:
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

The above config will emit a build folder like this: [./test/build](./test/build)
- `TestScript.dev.user.js`
  > Just the header, for development, `@requires` the main script.
  > Note: References the `developmentUrl` for resolving script content
- `TestScript.user.js` 
  > Main script, also suitible for distribution (such as in a git repo)
  > References the distribution urls, provided in the webpack example above.

Check out the code/types for more details.

## Development tips

To compile and serve your userscripts at, eg. `http://localhost:9002/${scriptName}.user.js`, then create an npm script like this:

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
