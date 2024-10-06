import * as esbuild from 'esbuild'

await esbuild.build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  drop: ['debugger'],
  // minify: true,
  outfile: 'bin/oneboot-tool.cjs',
  loader: {
    '.wasm': 'file',
  },
  publicPath: 'pkg',
  // format: 'esm',
  format: 'cjs',
  platform: 'node',
  external: ['tree-sitter', 'tree-sitter-java'],
  plugins: [],
  target: 'node16',
})
