import { fileURLToPath } from "url"
import { addPlugin, addServerHandler, createResolver, defineNuxtModule } from "@nuxt/kit"
import type { NitroEventHandler } from "nitropack"
import defu from "defu"
import * as fabricLib  from "fabric/node"
import path from "path"

export interface ModuleOptions {

    /**
     * @default built from request headers
     * @description The base URL of the site, no trailing slash!
     * @example http://localhost:3000
     * @example https://example.com
     * @example https://example.com/subdir
     */
    baseUrl?: string,

    /**
     * Endpoint URL for generating image(s)
     * @default /socialImage
     */
    path?: string

    /**
     * @default true
     * @description Whether to cache generated images
     */
    cache?: boolean


    /**
     * Directory where cached images will be stored
     * @default
     * () => {
     *       return `${__dirname}/cache`
     *  }
     */
    cacheDir: string

    /**
     * @default []
     * @description Array of fonts to load
     * @example
     * [
     *     {
     *       path: "src/fonts/Roboto/Roboto-Thin.ttf",
     *       options: {
     *          family: "robotothin"
     *       },
     *     },
     *     {
     *       path: "src/fonts/Roboto/Roboto-Regular.ttf",
     *       options: {
     *          family: "robotoregular"
     *       }
     *     }
     * ]
     */
    fonts?: Array<any>

    /**
     * @default "Fixed header text goes here"
     */
    fixedText?: string

    /**
     * @default {}
     * @description Background images to use for each section, or "default" for all sections, can be an array of images to randomly select from
     * @example
     * {
     *    "default": "socialBg.png",
     *    "about": "socialBgAbout.png",
     *    "experience": "socialBgExperience.png",
     *    "projects": "socialBgProjects.png",
     *    "references": "socialBgReferences.png",
     *    "skills": ["socialBgSkills.png", "socialBgSkills2.png", "socialBgSkills3.png"],
     * }
     */
    backgrounds?: {}

    /**
     * @default true
     * @description Whether to try and use images from the page to enhance the OpenGraph image
     */
    usePageImages?: boolean

    /**
     * Path to importable custom handler function
     * @default undefined
     *
     * @example "src/socialImage.handler.mjs"
     */
    customHandler?: string
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: "nuxt-dsi",
        configKey: "dsi"
    },
    defaults: {
        path: "/socialImage",
        cache: true,
        cacheDir: "cache",
        backgrounds: {
            default: "socialBg.png",
        },
        fixedText: "Fixed Header Copy Goes here",
        usePageImages: true,
    },
    setup: function (options, nuxt) {
        const resolver = createResolver(import.meta.url)
        const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url))
        const handlerPath = resolver.resolve(runtimeDir, "handler.get.mjs")
        nuxt.options.build.transpile.push(runtimeDir)
        nuxt.options.runtimeConfig.public.dsi = defu(nuxt.options.runtimeConfig.public.dsi, options)

        const handler: NitroEventHandler = {
            route: options.path,
            method: "get",
            handler: handlerPath
        }
        // addPlugin({
        // src: resolver.resolve("runtime/plugin.server")
        // })





        addServerHandler(handler)
    }
})
