import { fileURLToPath } from 'url';
import { existsSync, rmdirSync, mkdirSync } from 'fs';
import { defineNuxtModule, createResolver, addServerHandler } from '@nuxt/kit';
import defu from 'defu';



// -- Unbuild CommonJS Shims --
import __cjs_url__ from 'url';
import __cjs_path__ from 'path';
import __cjs_mod__ from 'module';
const __filename = __cjs_url__.fileURLToPath(import.meta.url);
const __dirname = __cjs_path__.dirname(__filename);
const require = __cjs_mod__.createRequire(import.meta.url);
const module = defineNuxtModule({
  meta: {
    name: "nuxt-dsi",
    configKey: "dsi"
  },
  defaults: {
    path: "/socialImage",
    cacheDir: "cache",
    fixedText: "Fixed Header Copy Goes here"
  },
  setup: function(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    const __dirname = resolve("");
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    const handlerPath = resolve(runtimeDir, "handler.get.mjs");
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.runtimeConfig.public.dsi = defu(nuxt.options.runtimeConfig.public.dsi, options);
    const cachePath = `${__dirname}/${options.cacheDir}`;
    if (existsSync(cachePath)) {
      rmdirSync(cachePath);
    }
    mkdirSync(cachePath);
    const handler = {
      route: options.path,
      handler: handlerPath
    };
    addServerHandler(handler);
  }
});

export { module as default };
