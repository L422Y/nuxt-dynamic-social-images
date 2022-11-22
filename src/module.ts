import {fileURLToPath} from 'url'
import {addPlugin, addServerHandler, createResolver, defineNuxtModule} from '@nuxt/kit'
import {NitroEventHandler} from 'nitropack'
import defu from 'defu'
import {fabric} from "fabric";
import {deregisterAllFonts} from "canvas";

export interface ModuleOptions {
  /**
   * Endpoint URL for generating image(s)
   * @default /socialImage
   */
  path?: string,
  /**
   * Directory where cached images will be stored
   * @default
   * () => {
   *       return `${__dirname}/cache`
   *  }
   */
  cacheDir: string,
  fonts?: Array<{ path: string, options: {} }>,
  fixedText?: string,

  /**
   * Path to custom image generation handler/function for importing
   * @example 'src/dsi-handler'
   */
  customHandler?: string,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-dsi',
    configKey: 'dsi'
  },
  defaults: {
    path: '/socialImage',
    cacheDir: 'cache',
    fixedText: 'Fixed Header Copy Goes here'
  },
  setup: function (options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const handlerPath = resolver.resolve(runtimeDir, 'handler.get.mjs')
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.public.dsi = defu(nuxt.options.runtimeConfig.public.dsi, options)

    const handler: NitroEventHandler = {
      route: options.path,
      handler: handlerPath
    }
    addPlugin({
      src: resolver.resolve('runtime/plugin.server')
    })
    addServerHandler(handler)
  }
})
