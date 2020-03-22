import { resolve } from 'path'
import { Configuration } from 'webpack'
import {
  TinyWebpackUserscriptPlugin,
  IMetaSchema,
} from '../TinyWebpackUserscriptPlugin'

const buildDirectory = resolve(__dirname, './build')
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

export default {
  mode: 'development',
  entry: `./${name}.ts`,
  plugins: [
    new TinyWebpackUserscriptPlugin({
      meta,
      developmentUrl: 'http://localhost:9002',
      appendOpenUserJSHeader: true,
    }),
  ],
  output: {
    path: buildDirectory,
    filename: `${name}.user.js`,
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
} as Configuration
