import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
// import resolve from 'rollup-plugin-node-resolve'
export default {
  input: './src/index.ts',
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          target: 'ES2017',
          module: 'ES2020'
        },
        exclude: [
          'node_modules',
          '**/*.test.ts',
          '**/*.spec.ts'
        ]
      }
    }),
    commonjs(),
    terser()
  ],
  output: [{
    format: 'cjs',
    file: 'dist/index.js',
    sourcemap: 'inline'
  }],
  external: [
    'write-file-atomic',
    // '@commonify/steno',
    '@commonify/lowdb',
    'fflate',
    'util',
    'fs',
    'lodash',
    'comment-json'
  ]
}
