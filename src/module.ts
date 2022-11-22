import { fileURLToPath } from 'url'
import { existsSync, mkdirSync, rmdirSync } from 'fs'
import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import { NitroEventHandler } from 'nitropack'
import defu from 'defu'

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
    const { resolve } = createResolver(import.meta.url)
    const __dirname: string = resolve('')
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    const handlerPath = resolve(runtimeDir, 'handler.get.mjs')
    nuxt.options.build.transpile.push(runtimeDir)
    nuxt.options.runtimeConfig.public.dsi = defu(nuxt.options.runtimeConfig.public.dsi, options)

    const cachePath = `${__dirname}/${options.cacheDir}`
    if (existsSync(cachePath)) {
      rmdirSync(cachePath)
    }
    mkdirSync(cachePath)

    const handler: NitroEventHandler = {
      route: options.path,
      handler: handlerPath
    }
    addServerHandler(handler)
  }
})
