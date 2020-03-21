import { resolve } from 'path';
import { Configuration } from 'webpack';
import { TinyWebpackUserscriptPlugin, IMetaSchema } from '../TinyWebpackUserscriptPlugin';


const buildDirectory = resolve(__dirname, './build');

const meta: IMetaSchema = {
  author: 'jim',
  license: 'MIT',
  name: 'TestScript',
  namespace: 'jim',
  version: '0.1.0',
}

export default <Configuration>{
  mode: "development",
  entry: { [meta.name]: `./${meta.name}.ts` },
  plugins: [
    new TinyWebpackUserscriptPlugin({
      distributionUrl: 'foo.com/wew',
      meta: meta,
      development: {
        baseUrl: 'http://localhost:9002'
      }
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
