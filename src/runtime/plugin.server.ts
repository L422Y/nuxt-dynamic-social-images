// @ts-ignore
import path from "path"
import { defineNuxtPlugin, useRuntimeConfig, useState } from "#imports"
import * as fabric from "fabric/node"

export default defineNuxtPlugin(() => {
    // try {
    //     const options = useRuntimeConfig().public.dsi
    //     console.log(`[nuxt-dsi] Using options: ${JSON.stringify(options)}`)
    //     if (process.env.fontsLoaded !== "true") {
    //
    //         console.log(`[nuxt-dsi] Loading fonts`)
    //         // @ts-ignore
    //         if (options?.fonts && fabric.nodeCanvas) {
    //             console.log(`[nuxt-dsi] Registering fonts`)
    //
    //             for (const font of options?.fonts) {
    //                 try {
    //                     const fPath = path.resolve("", font.path)
    //                     console.log(`[nuxt-dsi] Registering font: ${fPath}`)
    //                     // @ts-ignore
    //                     fabric.nodeCanvas.registerFont(fPath, font.options)
    //                 } catch (e) {
    //                     console.error(e)
    //                 }
    //             }
    //         } else {
    //             console.log(`[nuxt-dsi] No fonts to register`)
    //         }
    //         process.env.fontsLoaded = "true"
    //     } else {
    //         console.log(`[nuxt-dsi] Fonts already loaded`)
    //     }

        return {
            provide: {
                dsi: {
                    values: useState("dsi", () => {
                        return {}
                    })
                }
            }
        }
    // } catch (e) {
    //     console.error(e)
    //     throw e
    // }
})
