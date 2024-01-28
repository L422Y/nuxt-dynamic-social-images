import * as fs from "fs"
import { existsSync, readFileSync } from "fs"
import { appendHeader, defineEventHandler, getQuery, H3Event } from "h3"
import gm from "gm"
import { useRuntimeConfig } from "#imports"
import consola from "unenv/runtime/npm/consola"
import path from "path"
import { mkdir } from "unenv/runtime/node/fs"

const resolver = createResolver("cache")

const config = useRuntimeConfig()
const options = config.public.dsi

let imageRenderer: any | Function | undefined

const cachePath = resolver.resolve(`${options.cacheDir}`)
try {
    if (existsSync(cachePath)) {
        fs.rmSync(cachePath, {force: true, recursive: true})
    }
    mkdir(cachePath,
        {recursive: true},
        (err) => { /* empty */
        })
} catch (err) {
    /* empty */
}


class DSIGenerator {
    static textDefaults = {
        styles: {},
        fontFamily: "Arial",
        fill: "#ffffff",
        fontSize: 12,
        left: 50,
        top: 50,
        lineHeight: 0.8,
        textAlign: "left",
        lockRotation: true
    }

    static async getMetaData(data: Response): Promise<any> {
        const html = await data.text()
        let matches = html.matchAll(/<meta[^>]+(name|property)="([^")]*)[^>]+content="([^"]*).*?>/gm)
        if (!matches) {
            return {}
        }
        let title = html.matchAll(/<title>(.*)<\/title>/gm)?.next()?.value
        title = title[1] ? title[1] : false

        const values: any = {}
        for (const m of matches) {
            values[m[2].toString()] = m[3]
        }
        matches = html.matchAll(/<img src="([^"]+)"/gm)
        const images: Array<string> = [...matches].map(m => m[1]).filter(v => v.toLowerCase().match(/(.jpg|.png|.gif)$/))
        return {
            title,
            images,
            cleanTitle: values["clean:title"] || values.title || title,
            subTitle: values["clean:subtitle"] || values.subtitle,
            section: values["clean:section"] || values.section,
            desc: values["og:description"] || values.description
        }
    }
}


export default defineEventHandler(async (event: H3Event) => {


    const query = getQuery(event)

    if (query?.path) {
        const path = query.path.toString()
        const host = event.node.req.headers.host || "127.0.0.1:3000"
        const url = config.public.dsi.baseUrl || `http://${host}`
        const source = `${url}${path}`

        let pfn: string = path.replaceAll("/", "__")
        pfn = resolver.resolve(cachePath, `${pfn}.jpg`)
        let jpg
        if (config.public.dsi?.cache !== true || !existsSync(pfn) || process.env.NODE_ENV !== "production") {
            const response = await fetch(source)
                .then(DSIGenerator.getMetaData)
                .catch(err => console.error(err))

            const cleanTitle: string = response.cleanTitle || ""
            const subTitle: string = response.subTitle || ""
            const section: string = response.section || ""
            const title: string = response.title || ""
            const desc: string = response.desc || ""
            const images = response.images || []
            const textDefaults = DSIGenerator.textDefaults
            jpg = await imageRenderer({
                gm,
                options,
                textDefaults,
                cleanTitle,
                subTitle,
                section,
                title,
                desc,
                images,
                url
            }).catch((err) => {
                consola.error(err)
            })
        } else {
            jpg = readFileSync(pfn)
        }
        appendHeader(event, "Content-Type", "image/jpeg")
        return jpg
    }
})


interface renderedArgs {
    gm: any,
    options: any,
    textDefaults: any,
    cleanTitle: string,
    subTitle: string,
    section: string,
    title: string,
    desc: string,
    images: string[],
    url: string
}

const __dirname = path.resolve("")

const defaultImageRenderer = async (args: Partial<renderedArgs>) => {
    const {gm, options, textDefaults, cleanTitle, subTitle, section, title, desc, images} = args
    try {

        let Ypos = 0
        const width = 1200
        const height = 628
        const imageMagick = gm.subClass({imageMagick: true})
        let backgroundImage
        if (config.public.dsi?.backgrounds) {
            const backgrounds = config.public.dsi.backgrounds

            let bgPath = backgrounds["default"]

            if (section instanceof String && section.length > 0 && backgrounds.hasOwnProperty(section.toLowerCase())) {
                bgPath = backgrounds[section.toLowerCase()]
                if (Array.isArray(bgPath)) {
                    bgPath = bgPath[Math.floor(Math.random() * bgPath.length)]
                }
            } else if (Array.isArray(bgPath)) {
                bgPath = bgPath[Math.floor(Math.random() * bgPath.length)]
            }

            backgroundImage = path.resolve(`${__dirname}/public`, bgPath)
        }


        let image
        if (backgroundImage) {
            image = imageMagick(backgroundImage)
        } else {
            image = imageMagick(width, height, "#000000FF") // 1200x628, black background
        }

        image
            .fill("#FFFFFF")
            .font("./src/fonts/Roboto/Roboto-Thin.ttf")

            .fill("#00000070")
            .drawRectangle(0, 0, width, 80)

            .fill("#FFFFFF")
            .fontSize(25)
            .drawText(30, Ypos += 50, options.fixedText)

            .fontSize(35)
            .font("./src/fonts/Roboto/Roboto-Regular.ttf")
            .fill("#FFFFFF90")
            .drawText(30, Ypos += 80, section)
            .font("./src/fonts/Roboto/Roboto-Regular.ttf")
            .fill("#FFFFFF")
            .fontSize(65)

        Ypos += 70

        const titleLines = wrapText(cleanTitle, 1000, 65)
        titleLines.forEach((line, index) => {
            image.drawText(30, Ypos + ( index * 55 ), line)
        })

        Ypos += ( titleLines.length * 55 )


        image
            .fontSize(35)
            .font("./src/fonts/Roboto/Roboto-Thin.ttf")
            .drawText(30, Ypos += 0, subTitle)


        const descLines = wrapText(desc, 1000, 30)
        Ypos = 450
        image
            .fontSize(30)
            .fill("#FFFFFFaa")
            .font("./src/fonts/Roboto/Roboto-Regular.ttf")

        descLines.forEach((line, index) => {
            image.drawText(30, Ypos + ( index * 35 ), line)
        })


        const jpgBuffer = await new Promise((resolve, reject) => {
            image.toBuffer("JPG", (err, buffer) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(buffer)
                }
            })
        })
        // console.log('[nuxt-dsi] Returning image', jpgBuffer)
        return jpgBuffer

    } catch (e) {
        consola.error(e)
    }
}


function wrapText(text, maxLineWidth, fontSize = 80) {
    console.log({text, maxLineWidth})
    let words = text.split(" ")
    let lines = []
    let currentLine = ""

    words.forEach(word => {
        let testLine = currentLine + word + " "
        // Here we approximate the line width by character count.
        // You would replace the following line with a proper text measurement if possible.
        let lineWidth = testLine.length * ( fontSize * 0.4 ) // Approximation based on character width

        if (lineWidth < maxLineWidth) {
            currentLine = testLine
        } else {
            lines.push(currentLine.trim())
            currentLine = word + " "
        }
    })

    if (currentLine) {
        lines.push(currentLine.trim())
    }

    return lines
}


if (options?.customHandler) {
    const handlerPath = path.resolve("", options.customHandler)
    console.log(`[nuxt-dsi] Loading custom handler from \`${handlerPath}\``)
    const handler = await import(handlerPath).then((handler) => {
        if (handler.default) {
            imageRenderer = handler.default
        } else {
            consola.error(`[nuxt-dsi] No default export found in \`${handlerPath}\`!`)
            imageRenderer = defaultImageRenderer
        }
    }).catch((err) => {
        console.error(err)
        imageRenderer = defaultImageRenderer
    })
} else {
    console.log(`[nuxt-dsi] Using default handler...`)
    imageRenderer = defaultImageRenderer
}
