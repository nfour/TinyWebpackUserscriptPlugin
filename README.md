# Tiny Webpack Userscript Plugin

> - Allows one to bundle userscripts, using webpack
> - It's one file: [TinyWebpackUserscriptPlugin.ts](./TinyWebpackUserscriptPlugin.ts)

## Usage

This could be your `webpack.config.ts`:

```ts
const meta: IMetaSchema = {
  author: 'jim',
  license: 'MIT',
  name: 'TestScript',
  namespace: 'jim',
  version: '0.1.0',
}

export default <Configuration> {
  mode: "development",
  entry: { [meta.name]: `./${meta.name}.ts` },
  plugins: [
    new TinyWebpackUserscriptPlugin({
      meta,
      distributionUrl: 'foo.com/wew',
      developmentUrl: 'http://localhost:9002'
    })
  ],
  output: {
    path: buildDirectory,
    filename: `[name].user.js`
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