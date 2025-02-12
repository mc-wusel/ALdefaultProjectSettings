const path = require('path');

module.exports = {
  entry: './src/extension.ts',
  target: 'node', 
  mode: 'production',           
  module: {
    rules: [
      {
        test: /\.tsx?$/,          
        use: 'ts-loader',        
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
    externals: {
    vscode: 'commonjs vscode',
    fs: 'commonjs fs',
    path: 'commonjs path',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
