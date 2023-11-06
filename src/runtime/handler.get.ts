import * as fs from "fs"
import { existsSync, readFileSync } from "fs"
import { appendHeader, defineEventHandler, getQuery, H3Event } from "h3"
import gm from "gm"
import { createResolver } from "@nuxt/kit"
import { useRuntimeConfig } from "#imports"
import consola from "unenv/runtime/npm/consola"
import path from "path"

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

const defaultImageRenderer = async (args: Partial<renderedArgs>) => {
    const {options, textDefaults, cleanTitle, subTitle, section, title, desc, images} = args
    try {

        let Ypos = 0
        const width = 1200
        const height = 628
        console.log({options, width, height, textDefaults, cleanTitle, subTitle, section, title, desc, images})
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


// const defaultImageRenderer2 = async ( options: any, width: number, height: number, textDefaults: any, cleanTitle: string, subTitle: string, section: string, title: string, desc: string, images: string[], url: string) => {

// const canvas = new fabric.StaticCanvas(null, {
//     width: width,
//     height: height,
//     backgroundColor: "#000000"
// })
//
// const x = 0
// const y = 0


//
// const __dirname = path.resolve("")
//
// if (config.public.dsi?.backgrounds) {
//     const backgrounds = config.public.dsi.backgrounds
//
//     let bgPath = backgrounds["default"]
//
//     if (section instanceof String && section.length > 0 && backgrounds.hasOwnProperty(section.toLowerCase())) {
//         bgPath = backgrounds[section.toLowerCase()]
//         if (Array.isArray(bgPath)) {
//             bgPath = bgPath[Math.floor(Math.random() * bgPath.length)]
//         }
//     } else if (Array.isArray(bgPath)) {
//         bgPath = bgPath[Math.floor(Math.random() * bgPath.length)]
//     }
//
//     const socialBg = path.resolve(`${__dirname}/public`, bgPath)
//
//     image
//         .composite(socialBg)
//         .geometry(`+${x}+${y}`)
//
//     //
//     //
//     // const img = await fabric.Image.fromURL(`file://${socialBg}`)
//     //     .then((img) => {
//     //         img.scaleToHeight(height)
//     //         img.scaleToWidth(width)
//     //         // img.filters.push(new fabric.filters.Blur({blur: 0}))
//     //         // img.applyFilters()
//     //         canvas.add(img)
//     //         canvas.centerObject(img)
//     //         return img
//     //     }).catch((err) => {
//     //         consola.error(err)
//     //     })
// }
//
// //
// // if (config.public.dsi?.usePageImages && images?.length > 0) {
// //     let imgPath = images[0]
// //     if (imgPath) {
// //         if (imgPath.startsWith("/_ipx")) {
// //             imgPath = imgPath.split("/").splice(3).join("/")
// //         }
// //
// //         imgPath = createResolver("public").resolve(imgPath)
// //         const img: fabric.Image = await new Promise((resolve, reject) => {
// //             fabric.Image.fromURL(`file://${imgPath}`,
// //                 (img: fabric.Image) => {
// //                     if (img) {
// //                         img.scaleToHeight(height)
// //                         img.scaleToWidth(width)
// //                         // @ts-ignore
// //                         img.filters.push(new fabric.Image.filters.Blur({blur: 0.33}))
// //                         img.applyFilters()
// //                     }
// //                     resolve(img)
// //                 }, {
// //                     opacity: 0.60
// //                 })
// //         })
// //         if (img) {
// //             canvas.add(img)
// //             canvas.centerObject(img)
// //         }
// //     }
// // }
// //
// // let textTop = 30
// // const bioText = new fabric.Textbox(
// //     options.fixedText || "", defu({
// //         top: textTop,
// //         width: width - 100,
// //         fill: "#fffffffb",
// //         fontSize: 32,
// //         fontWeight: "100"
// //     }, textDefaults))
// //
// // textTop += 90
// //
// // const bgBoxTop = new fabric.Rect({
// //     width: 1200,
// //     height: ( bioText.height || 0 ) + 60,
// //     fill: "#00000050",
// //     left: 0,
// //     top: 0
// //
// // })
// // canvas.add(bgBoxTop)
// // canvas.add(bioText)
// //
// // if (section) {
// //     const sectTitle = new fabric.Textbox(
// //         `${section}`, defu({
// //             width: width - 300,
// //             fill: "#ffffff90",
// //             fontSize: 28,
// //             left: 50,
// //             lineHeight: 1.2,
// //             top: textTop
// //         }, textDefaults))
// //
// //     canvas.add(sectTitle)
// //     textTop += ( sectTitle.height || 0 )
// // }
// //
// // const titleTextBG = new fabric.Textbox(
// //     `${cleanTitle}`, defu({
// //         width: width - 100,
// //         fontWeight: "normal",
// //         fill: "#ffffff10",
// //         fontSize: 408,
// //         charSpacing: -40,
// //         lineHeight: 0.7,
// //         left: 0,
// //         top: -30
// //     }, textDefaults))
// //
// // canvas.add(titleTextBG)
// //
// // if (cleanTitle) {
// //     const titleText = new fabric.Textbox(
// //         `${cleanTitle}`, defu({
// //             top: textTop,
// //             width: width - 100,
// //             fill: "#fffffff0",
// //             fontSize: 80,
// //             left: 50,
// //             fontWeight: "bold"
// //         }, textDefaults))
// //     canvas.add(titleText)
// //     textTop += ( titleText.height || 0 )
// // }
// //
// // if (subTitle) {
// //     const subTitleText = new fabric.Textbox(
// //         `${subTitle}`, defu({
// //             top: textTop,
// //             width: width - 100,
// //             fill: "#fffffff0",
// //             fontSize: 25,
// //             left: 50
// //         }, textDefaults))
// //
// //     canvas.add(subTitleText)
// //     textTop += 80 + ( subTitleText.height || 0 )
// // } else {
// //     textTop += 80 + 20
// // }
// //
// // if (desc) {
// //     const bgBox = new fabric.Rect({
// //         width: 1200,
// //         height: height - textTop + 120,
// //         fill: "#00000050",
// //         left: 0,
// //         top: textTop - 50
// //     })
// //
// //     canvas.add(bgBox)
// //
// //     const descText = new fabric.Textbox(
// //         `${desc}`, defu({
// //             width: width - 300,
// //             fill: "#ffffffaa",
// //             fontSize: 32,
// //             left: 50,
// //             lineHeight: 1.2,
// //             top: textTop
// //         }, textDefaults))
// //     canvas.add(descText)
// // }
//
// image.drawText(50, 30, options.fixedText)
// image.drawText(50, 90, section)
// image.drawText(0, -30, cleanTitle)
// image.drawText(50, 90 + 80 + 20, title)
// image.drawText(50, 90 + 80 + 20 + 80 + 20, subTitle)
// image.drawText(50, 90 + 80 + 20 + 80 + 20 + 80 + 20, desc)
//
//
// // image.in("-fill", "#fffffffb")
// // image.in("-font", "Roboto-Thin")
// // image.in("-gravity", "North")
// // image.in("-pointsize", "32")
// // image.in("-draw", `text 50,30 "${options.fixedText}"`)
// // image.in("-fill", "#ffffff90")
// // image.in("-font", "Roboto-Regular")
// // image.in("-pointsize", "28")
// // image.in("-draw", `text 50,90 "${section}"`)
// // image.in("-fill", "#ffffff10")
// // image.in("-font", "Roboto-Regular")
// // image.in("-pointsize", "408")
// // image.in("-draw", `text 0,-30 "${cleanTitle}"`)
// // image.in("-fill", "#fffffff0")
// // image.in("-font", "Roboto-Bold")
// // image.in("-pointsize", "80")
// // image.in("-draw", `text 50,${90 + 80 + 20} "${title}"`)
// // image.in("-fill", "#fffffff0")
// // image.in("-font", "Roboto-Regular")
// // image.in("-pointsize", "25")
// // image.in("-draw", `text 50,${90 + 80 + 20 + 80 + 20} "${subTitle}"`)
// // image.in("-fill", "#ffffffaa")
// // image.in("-font", "Roboto-Regular")
// // image.in("-pointsize", "32")
// // image.in("-draw", `text 50,${90 + 80 + 20 + 80 + 20 + 80 + 20} "${desc}"`)
// // image.in("-fill", "#ffffffaa")
// // image.in("-font", "Roboto-Regular")
//
//
// return new Promise((resolve, reject) => {
//     image.stream("jpg", (err, stdout, stderr) => {
//         if (err) {
//             reject(err)
//         }
//         resolve(stdout)
//     })
// }
// /**/
//     return image
// }

if (config.public.dsi?.customHandler) {
    const handlerPath = path.resolve(config.public.dsi.customHandler)
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
    imageRenderer = defaultImageRenderer
}
