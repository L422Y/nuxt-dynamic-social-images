import { fileURLToPath } from 'url';
import { defineNuxtModule, createResolver, addPlugin, addServerHandler } from '@nuxt/kit';
import defu from 'defu';

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
    const resolver = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    const handlerPath = resolver.resolve(runtimeDir, "handler.get.mjs");
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.runtimeConfig.public.dsi = defu(nuxt.options.runtimeConfig.public.dsi, options);
    const handler = {
      route: options.path,
      handler: handlerPath
    };
    addPlugin({
      src: resolver.resolve("runtime/plugin.server")
    });
    addServerHandler(handler);
  }
});

export { module as default };
