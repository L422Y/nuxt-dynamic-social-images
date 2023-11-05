// @ts-ignore
import path from 'path'
import * as fabric from 'fabric/node'
import { defineNuxtPlugin, useRuntimeConfig, useState } from '#imports'

export default defineNuxtPlugin(() => {
  const options = useRuntimeConfig().public.dsi
  if (process.env.fontsLoaded !== 'true') {
    // @ts-ignore
    if (options?.fonts && fabric.nodeCanvas) {
      for (const font of options?.fonts) {
        const fPath = path.resolve(font.path)
        // @ts-ignore
        fabric.nodeCanvas.registerFont(fPath, font.options)
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
