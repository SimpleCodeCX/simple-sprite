import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  input: './src/main.js',
  moduleName: 'sprite',
  output: [
    {
      file: 'npm-publish/umd/simple-sprite.umd.js',
      format: 'umd',
      name: 'sprite'
    },
    {
      file: 'npm-publish/es/simple-sprite.es.js',
      format: 'es'
    },
    {
      file: 'npm-publish/cjs/simple-sprite.cjs.js',
      format: 'cjs'
    },
    {
      file: 'npm-publish/amd/bundle.amd.js',
      format: 'amd'
    }
  ],
  plugins: [
    nodeResolve({
      module: true,
      jsnext: true,
      main: true
    }),
    commonjs(),
    babel(),
    json(),
    uglify()
  ]
}