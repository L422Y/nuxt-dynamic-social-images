import { fileURLToPath } from 'url';
import { defineNuxtModule, createResolver, addServerHandler } from '@nuxt/kit';
import defu from 'defu';

const module = defineNuxtModule({
  meta: {
    name: "nuxt-dsi",
    configKey: "dsi"
  },
  defaults: {
    path: "/socialImage",
    cache: true,
    cacheDir: "cache",
    backgrounds: {
      default: "socialBg.png"
    },
    fixedText: "Fixed Header Copy Goes here",
    usePageImages: true
  },
  setup: function(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    const handlerPath = resolver.resolve(runtimeDir, "handler.get.mjs");
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.runtimeConfig.public.dsi = defu(nuxt.options.runtimeConfig.public.dsi, options);
    const handler = {
      route: options.path,
      method: "get",
      handler: handlerPath
    };
    addServerHandler(handler);
  }
});

export { module as default };
