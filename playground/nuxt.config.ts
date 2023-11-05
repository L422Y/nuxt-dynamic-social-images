import path from 'path'
import { defineNuxtConfig } from 'nuxt/config'
import NuxtDSI from '..'

import { DSIHandler } from './src/dsi-handler.get'

export default defineNuxtConfig({
  modules: [
    'nuxt-dsi'
  ],
  dsi: {
    fixedText: 'Nuxt: Dynamic Social Images',
    fonts: [
      { path: path.resolve(__dirname, './fonts/ConnectionIi-2wj8.otf'), options: { family: 'connectionii' } },
      { path: path.resolve(__dirname, './fonts/Barlow/Barlow-thin.ttf'), options: { family: 'barlowthin' } }
    ]
  }
})
