// @ts-ignore
import {defineNuxtPlugin, useRuntimeConfig, useState} from '#app'
import {fabric} from "fabric"
import {deregisterAllFonts} from "canvas"
import {createResolver} from "@nuxt/kit"


export default defineNuxtPlugin(() => {
  const resolver = createResolver('~')
  const {public: {dsi: options}} = useRuntimeConfig()
  if (process.env.fontsLoaded !== 'true') {
    if (options?.fonts && fabric.nodeCanvas) {
      deregisterAllFonts()
      for (const font of options?.fonts) {
        const fPath = resolver.resolve('..', font.path)
        try {
          fabric.nodeCanvas.registerFont(fPath, font.options)
        } catch (err) {
          /* empty */
        }
      }
    }
    process.env.fontsLoaded = 'true'
  }
  return {
    provide: {
      dsi: {
        values: useState('dsi', () => {
          return {}
        })
      }
    }
  }
})
