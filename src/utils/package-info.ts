export default {
  "name": "@ddd-tool/create-oneboot",
  "version": "0.0.1-alpha.7",
  "private": false,
  "description": "",
  "type": "module",
  "bin": {
    "oneboot-tool": "./bin/oneboot-tool.cjs"
  },
  "files": [
    "./bin"
  ],
  "engines": {
    "node": ">=v18.3.0"
  },
  "scripts": {
    "dev": "pnpm build && node ./bin/oneboot-tool.cjs start",
    "dev2": "pnpm build && node ./bin/oneboot-tool.cjs genVoMapper --project-root=F:/idea_projects/oneboot --domain-module=domain-preset_sys --output-module=preset_sys",
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
    "url": "git+https://github.com/AlphaFoxz/oneboot-tool.git"
  },
  "license": "Apache-2.0",
  "dependencies": {
    "@vue/reactivity": "^3.5.12",
    "tree-sitter": "^0.21.1",
    "tree-sitter-java": "^0.23.2"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@tsconfig/node20": "^20.1.4",
    "@types/jest": "^29.5.13",
    "@types/node": "^22.7.4",
    "@types/prompts": "^2.4.9",
    "commander": "^12.1.0",
    "esbuild": "^0.23.1",
    "jest": "^29.7.0",
    "ncp": "^2.0.0",
    "prompts": "^2.4.2",
    "read-pkg": "^9.0.1",
    "ts-jest": "^29.2.5",
    "ts-node": "^10.9.2",
    "typescript": "^5.6.2",
    "zx": "^8.1.8"
  },
  "bugs": {
    "url": "https://github.com/AlphaFoxz/oneboot-tool/issues"
  },
  "readme": "ERROR: No README data found!",
  "homepage": "https://github.com/AlphaFoxz/oneboot-tool#readme",
  "_id": "@ddd-tool/create-oneboot@0.0.1-alpha.7"
}