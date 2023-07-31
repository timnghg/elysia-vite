# elysia-vite ![Test](https://github.com/timnghg/elysia-vite/actions/workflows/main.yml/badge.svg)

Simple [Elysia](https://elysiajs.com/) plugin that helps you use Vite. It serve your entry html file with Vite's scripts injected.

## 1. Installation

### 1.1. Vite and plugins

Please follow [Vite's offical document](https://vitejs.dev/guide/). The following code is my simple React setup.

```bash
# Bash:
# Install vite itself
bun add vite -d

# add your Vite's plugin, DO NOT RUN if you aren't using React.
bun add @vitejs/plugin-react -d
```

```js
// File: vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/client", // replace with your frontend code dir
  plugins: [
    react() // replace with your plugin
  ],
});
```

### 1.2. `elysia-vite`

```bash
bun add elysia-vite
``` 

## 2. Usage

### Use Elysia `elysia-vite` plugin
```js
// File: index.ts
const {Elysia} = require('elysia')
const {elysiaVite} = require('elysia-vite')
const app = new Elysia()
    // 1. use as plugin
    .use(elysiaVite({
        base: '/app', // url path to serve index.html file or leave blank to serve as root path
        viteConfigFile: `${import.meta.dir}/vite.config.ts`, // absolute path to your vite config file
        entryHtmlFile: `${import.meta.dir}/src/client/index.html`, // absolute path to your entry html file
        entryClientFile: `${import.meta.dir}/src/client/index.tsx`, // absolute path to your entry script file
        isReact: true, // inject React's specific HRM code @see https://vitejs.dev/guide/api-hmr.html
        placeHolderDevScripts: '<!--vite-dev-scripts-->', // placeholder to replace vite scripts
    }))
    .listen(3000)

// goto http://localhost:3000/app
```

