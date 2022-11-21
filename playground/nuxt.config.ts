import { defineNuxtConfig } from 'nuxt/config'
import NuxtDSI from '..'

export default defineNuxtConfig({
  modules: [
    NuxtDSI
  ],
  dsi: {
    fixedText: 'Nuxt: Dynamic Social Images',
    customHandler: 'playground/src/dsi-handler.mjs',
    fonts: [
      { path: 'playground/fonts/ConnectionIi-2wj8.otf', options: { family: 'connectionii' } },
      { path: 'playground/fonts/Barlow/Barlow-thin.ttf', options: { family: 'barlowthin' } }
    ]
  }
})
