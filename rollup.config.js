import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  plugins: [
    nodeResolve(),
    babel({
      babelrc: false,
      presets: [ ['@babel/preset-env', { modules: false, exclude: ['transform-regenerator'] }], '@babel/preset-flow' ],
      exclude: ['node_modules/**']
    })
  ],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ]
}
