export default {
  "name": "@ddd-tool/create-oneboot",
  "version": "0.0.1-alpha.8",
  "private": false,
  "description": "",
  "type": "module",
  "bin": {
    "create-oneboot": "./bin/create-oneboot.cjs"
  },
  "files": [
    "./bin"
  ],
  "engines": {
    "node": ">=v18.3.0"
  },
  "scripts": {
    "dev": "pnpm build && node ./bin/create-oneboot.cjs start",
    "dev2": "pnpm build && node ./bin/create-oneboot.cjs genVoMapper --project-root=F:/idea_projects/oneboot --domain-module=domain-preset_sys --output-module=preset_sys",
    "build": "pnpm build:ts",
    "build:ts": "pnpm verify && zx ./scripts/build.mjs",
    "build:wasm": "wasm-pack build ./src-rust/ --target nodejs --out-dir ../pkg && ncp ./pkg/wasm_bg.wasm ./bin/wasm_bg.wasm",
    "test": "pnpm build && npx jest",
    "verify": "tsc -p ./tsconfig.build.json"
  },
  "keywords": [
    "oneboot"
  ],
  "author": {
    "name": "AlphaFoxz@github.com",
    "email": "841958335@qq.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ddd-tool/create-oneboot.git"
  },
  "license": "Apache-2.0",
  "dependencies": {
    "tree-sitter": "^0.21.1",
    "tree-sitter-java": "^0.23.2"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@tsconfig/node20": "^20.1.4",
    "@types/jest": "^29.5.13",
    "@types/node": "^22.7.5",
    "@types/prompts": "^2.4.9",
    "@vue/reactivity": "^3.5.12",
    "commander": "^12.1.0",
    "esbuild": "^0.23.1",
    "jest": "^29.7.0",
    "ncp": "^2.0.0",
    "prompts": "^2.4.2",
    "read-pkg": "^9.0.1",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3",
    "vue-fn": "^0.0.2",
    "zx": "^8.1.9"
  },
  "bugs": {
    "url": "https://github.com/ddd-tool/create-oneboot/issues"
  },
  "readme": "ERROR: No README data found!",
  "homepage": "https://github.com/ddd-tool/create-oneboot#readme",
  "_id": "@ddd-tool/create-oneboot@0.0.1-alpha.8"
}