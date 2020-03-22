import { resolve } from 'path';
import { Configuration } from 'webpack';
import {
  TinyWebpackUserscriptPlugin,
  IMetaSchema,
} from '../TinyWebpackUserscriptPlugin';

const buildDirectory = resolve(__dirname, './build');
const scriptName = 'TestScript';
const meta: IMetaSchema = {
  name: scriptName,
  author: 'jim',
  license: 'MIT',
  namespace: 'jim',
  version: '0.1.0',
  updateURL: `http://github.com/nfour/tiny-webpack-userscript-plugin/master/tree/test/build/${scriptName}.user.js`,
  downloadURL: `http://github.com/nfour/tiny-webpack-userscript-plugin/master/tree/test/build/${scriptName}.user.js`,
};

export default {
  mode: 'development',
  entry: `./${scriptName}.ts`,
  plugins: [
    new TinyWebpackUserscriptPlugin({
      scriptName,
      headers: [
        { meta },
        { headerName: 'OpenUserJS', meta: { author: meta.author } },
      ],
      developmentUrl: 'http://localhost:9002',
      addTimestampToVersionInDevelopment: false,
    }),
  ],
  output: {
    path: buildDirectory,
    filename: `${scriptName}.user.js`,
  },
  resolve: { extensions: ['.ts', '.js'] },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
} as Configuration;
