import { defineNuxtConfig } from 'nuxt/config'
import NuxtDSI from '..'

export default defineNuxtConfig({
  modules: [
    NuxtDSI
  ],
  dsi: {
    fixedText: 'Nuxt: Dynamic Social Images',
    customHandler: 'src/dsi-handler.mjs',
    fonts: [
      { path: 'fonts/ConnectionIi-2wj8.otf', options: { family: 'connectionii' } },
      { path: 'fonts/Barlow/Barlow-thin.ttf', options: { family: 'barlowthin' } }
    ]
  }
})
