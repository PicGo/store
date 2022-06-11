import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
// import resolve from 'rollup-plugin-node-resolve'
export default {
  input: './src/index.ts',
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'ESNext'
        },
        exclude: [
          'node_modules',
          '**/*.test.ts',
          '**/*.spec.ts'
        ]
      }
    }),
    terser()
  ],
  output: [{
    format: 'cjs',
    file: 'dist/index.js',
    sourcemap: true
  }],
  external: [
    'write-file-atomic',
    // '@commonify/steno',
    '@commonify/lowdb',
    'fflate',
    'util',
    'fs'
  ]
}
