import { fileURLToPath } from 'url'
import { addPlugin, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NitroEventHandler } from 'nitropack'
import defu from 'defu'

export interface ModuleOptions {

  /**
   * @default built from request headers
   * @description The base URL of the site, no trailing slash!
   * @example http://localhost:3000
   * @example https://example.com
   * @example https://example.com/subdir
   */
    baseUrl?: string,
  /**
   * Endpoint URL for generating image(s)
   * @default /socialImage
   */
  path?: string
  /**
   * Directory where cached images will be stored
   * @default
   * () => {
   *       return `${__dirname}/cache`
   *  }
   */
  cacheDir: string
  fonts?: Array<any>
  fixedText?: string

  /**
   * Path to importable custom handler function
   */
  customHandler?: string
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
      method: 'get',
      handler: handlerPath
    }
    addPlugin({
      src: resolver.resolve('runtime/plugin.server')
    })
    addServerHandler(handler)
  }
})
