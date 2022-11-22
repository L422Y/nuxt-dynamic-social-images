import * as fs from 'fs'
import { createWriteStream, existsSync, mkdir, readFileSync } from 'fs'
import { appendHeader, defineEventHandler, getQuery, H3Event } from 'h3'
import { fabric } from 'fabric'
import defu from 'defu'
import { createResolver } from '@nuxt/kit'
import { ModuleOptions } from '../module'
import { useRuntimeConfig } from '#imports'

const resolver = createResolver(import.meta.url)

const config = useRuntimeConfig()
const options = config.public.dsi as ModuleOptions

let imageRenderer: any | Function | undefined

const cachePath = resolver.resolve('.nuxt/', `${options.cacheDir}`)
try {
  if (existsSync(cachePath)) {
    fs.rmSync(cachePath, { force: true, recursive: true })
  }
  // eslint-disable-next-line n/handle-callback-err
  mkdir(cachePath, { recursive: true }, (err) => { /* empty */ })
} catch (err) {
  /* empty */
}

class DSIGenerator {
  static textDefaults = {
    styles: {},
    fontFamily: 'Arial',
    fill: '#ffffff',
    fontSize: 12,
    left: 50,
    top: 50,
    lineHeight: 0.8,
    textAlign: 'left',
    lockRotation: true
  }

  static async getMetaData (data: Response) {
    const html = await data.text()
    let matches = html.matchAll(/<meta[^>]+(name|property)="([^")]*)[^>]+content="([^"]*).*?>/gm)
    let title = html.matchAll(/<title>(.*)<\/title>/gm)?.next()?.value
    title = title[1] ? title[1] : false

    const values: object = {}
    for (const m of matches) {
      // @ts-ignore
      values[m[2].toString()] = m[3]
    }
    matches = html.matchAll(/<img src="([^"]+)"/gm)
    const images: Array<string> = [...matches].map(m => m[1])
    return {
      title,
      images,
      // @ts-ignore
      cleanTitle: values['clean:title'] || values.title || title,
      // @ts-ignore
      subTitle: values['clean:subtitle'] || values.subtitle,
      // @ts-ignore
      section: values['clean:section'] || values.section,
      // @ts-ignore
      desc: values['og:description'] || values.description
    }
  }
}

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event)
  if (query?.path) {
    const path = query.path.toString()
    let pfn: string = path.replaceAll('/', '__')
    pfn = resolver.resolve(cachePath, `${pfn}.jpg`)

    const host = event.node.req.headers?.host
    let jpg

    if (!existsSync(pfn) || process.dev) {
      const source = `http://${host}${path}`
      const width = 1200
      const height = 628
      const canvas = new fabric.StaticCanvas(null, { width, height, backgroundColor: '#000000' })

      const {
        cleanTitle,
        subTitle,
        section,
        title,
        desc,
        images
      } = await fetch(source)
        .then(DSIGenerator.getMetaData)
        .catch(err => console.error(err))

      const textDefaults = DSIGenerator.textDefaults
      await imageRenderer({
        fabric,
        options,
        canvas,
        width,
        height,
        textDefaults,
        cleanTitle,
        subTitle,
        section,
        title,
        desc,
        images
      })
      canvas.renderAll()
      // @ts-ignore
      jpg = await canvas.createJPEGStream()
      await jpg.pipe(createWriteStream(pfn))
    } else {
      jpg = readFileSync(pfn)
    }
    appendHeader(event, 'Content-Type', 'image/jpeg')
    return jpg
  }
})

const defaultImageRenderer = async (
  {
    fabric,
    options,
    canvas,
    width,
    height,
    textDefaults,
    cleanTitle,
    subTitle,
    section,
    title,
    desc,
    images
  }) => {
  textDefaults = {
    styles: {},
    fontFamily: 'arial',
    fill: '#ffffff',
    fontSize: 12,
    left: 50,
    top: 50,
    lineHeight: 0.8,
    textAlign: 'left',
    lockRotation: true
  }

  if (images?.length > 0) {
    let imgPath = images[0]
    if (imgPath && imgPath.includes('assets')) {
      imgPath = imgPath.split('assets/')[1]
      // eslint-disable-next-line n/no-path-concat
      imgPath = `file://${__dirname}/public/assets/${imgPath}`
      const img = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(imgPath,
          (img: fabric.Image) => {
            if (img) {
              img.scaleToHeight(height)
              img.scaleToWidth(width)
              // @ts-ignore
              img.filters.push(new fabric.Image.filters.Blur({ blur: 0.33 }))
              img.applyFilters()
            }
            resolve(img)
          }, {
            opacity: 0.60
          })
      })
      if (img) {
        canvas.add(img)
        canvas.centerObject(img)
      }
    }
  }

  let textTop = 30
  const bioText = new fabric.Textbox(
    options.fixedText || '', defu({
      top: textTop,
      width: width - 100,
      fill: '#fffffffb',
      fontSize: 32,
      fontWeight: '100'
    }, textDefaults))

  textTop += 90

  const bgBoxTop = new fabric.Rect({
    width: 1200,
    height: (bioText.height || 0) + 60,
    fill: '#00000050',
    left: 0,
    top: 0

  })
  canvas.add(bgBoxTop)
  canvas.add(bioText)

  if (section) {
    const sectTitle = new fabric.Textbox(
      `${section}`, defu({
        width: width - 300,
        fill: '#ffffff90',
        fontSize: 28,
        left: 50,
        lineHeight: 1.2,
        top: textTop
      }, textDefaults))

    canvas.add(sectTitle)
    textTop += (sectTitle.height || 0)
  }

  const titleTextBG = new fabric.Textbox(
    `${cleanTitle}`, defu({
      width: width - 100,
      fontWeight: 'normal',
      fill: '#ffffff10',
      fontSize: 408,
      charSpacing: -40,
      lineHeight: 0.7,
      left: 0,
      top: -30
    }, textDefaults))

  canvas.add(titleTextBG)

  if (cleanTitle) {
    const titleText = new fabric.Textbox(
      `${cleanTitle}`, defu({
        top: textTop,
        width: width - 100,
        fill: '#fffffff0',
        fontSize: 80,
        left: 50,
        fontWeight: 'bold'
      }, textDefaults))
    canvas.add(titleText)
    textTop += (titleText.height || 0)
  }

  if (subTitle) {
    const subTitleText = new fabric.Textbox(
      `${subTitle}`, defu({
        top: textTop,
        width: width - 100,
        fill: '#fffffff0',
        fontSize: 25,
        left: 50
      }, textDefaults))

    canvas.add(subTitleText)
    textTop += 80 + (subTitleText.height || 0)
  } else {
    textTop += 80 + 20
  }

  if (desc) {
    const bgBox = new fabric.Rect({
      width: 1200,
      height: height - textTop + 120,
      fill: '#00000050',
      left: 0,
      top: textTop - 50
    })

    canvas.add(bgBox)

    const descText = new fabric.Textbox(
      `${desc}`, defu({
        width: width - 300,
        fill: '#ffffffaa',
        fontSize: 32,
        left: 50,
        lineHeight: 1.2,
        top: textTop
      }, textDefaults))
    canvas.add(descText)
  }
}

if (config.public.dsi?.customHandler) {
  const rendererPath = config.public.dsi.customHandler
  const ch = await import(resolver.resolve('../..', rendererPath))
  imageRenderer = ch.default
} else {
  imageRenderer = defaultImageRenderer
}
