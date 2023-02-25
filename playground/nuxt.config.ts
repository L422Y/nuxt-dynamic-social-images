import { defineNuxtConfig } from 'nuxt/config'
import NuxtDSI from '..'

import { DSIHandler } from './src/dsi-handler.get'

export default defineNuxtConfig({
  modules: [
    NuxtDSI
  ],
  dsi: {
    fixedText: 'Nuxt: Dynamic Social Images',
    customHandler: DSIHandler,
    fonts: [
      { path: 'fonts/ConnectionIi-2wj8.otf', options: { family: 'connectionii' } },
      { path: 'fonts/Barlow/Barlow-thin.ttf', options: { family: 'barlowthin' } }
    ]
  }
})
