// @ts-ignore
import path from 'path'
import { defineNuxtPlugin, useRuntimeConfig, useState } from '#app'
import { fabric } from 'fabric'
import { deregisterAllFonts } from 'canvas'

export default defineNuxtPlugin(() => {
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
