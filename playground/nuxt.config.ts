import { defineNuxtConfig } from 'nuxt/config'
import NuxtDSI from '..'

import { DSIHandler } from './src/dsi-handler.get'
import path from "path"

export default defineNuxtConfig({
  modules: [
    NuxtDSI
  ],
  dsi: {
    fixedText: 'Nuxt: Dynamic Social Images',
    customHandler: DSIHandler,
    fonts: [
      { path: path.resolve(__dirname, './fonts/ConnectionIi-2wj8.otf'), options: { family: 'connectionii' } },
      { path: path.resolve(__dirname, './fonts/Barlow/Barlow-thin.ttf'), options: { family: 'barlowthin' } }
    ]
  }
})
