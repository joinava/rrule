import path from 'path'
import TerserPlugin from 'terser-webpack-plugin'
import UnminifiedWebpackPlugin from 'unminified-webpack-plugin'
import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const paths = {
  source: path.resolve(__dirname, 'src'),
  es5: path.resolve(__dirname, 'dist', 'es5'),
}

const commonConfig = {
  output: {
    filename: '[name].min.js',
    path: paths.es5,
    library: { name: 'rrule', type: 'module' },
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this",
  },
  devtool: 'source-map',
  mode: 'production',
  resolve: {
    extensions: ['.js', '.ts'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: 'ts-loader',
        test: /\.ts$/,
        options: {
          configFile: 'tsconfig.build.json',
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [new UnminifiedWebpackPlugin()],
}

const rruleConfig = Object.assign(
  {
    entry: {
      rrule: path.join(paths.source, 'index.ts'),
    },
  },
  commonConfig
)

export default [rruleConfig]
