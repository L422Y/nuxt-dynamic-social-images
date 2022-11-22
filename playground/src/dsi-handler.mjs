import defu from "defu";
import {createResolver} from "@nuxt/kit";

export default async (
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
) => {
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
    if (imgPath) {
      if (imgPath.startsWith('/_ipx')) {
        imgPath = imgPath.split('/').splice(3).join('/')
      }
      // eslint-disable-next-line n/no-path-concat
      imgPath = createResolver('public').resolve(imgPath)
      const img = await new Promise((resolve, reject) => {
        fabric.Image.fromURL(`file://${imgPath}`,
          (img) => {
            img.scaleToHeight(height)
            img.scaleToWidth(width)
            // @ts-ignore
            img.filters.push(new fabric.Image.filters.Blur({blur: 0.33}))
            img.applyFilters()
            resolve(img)
          }, {
            opacity: 0.60
          })
      })
      canvas.add(img)
      canvas.centerObject(img)
    }
  }

  let textTop = 30
  const bioText = new fabric.Textbox(
    options?.fixedText || '', defu({
      top: textTop,
      fontFamily: 'connectionii',
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
        fontFamily: 'connectionii',
        lineHeight: 1.2,
        top: textTop
      }, textDefaults))

    canvas.add(sectTitle)
    textTop += (sectTitle.height || 0)
  }


  if (cleanTitle) {

    const titleTextBG = new fabric.Textbox(
      `${cleanTitle}`, defu({
        width: width - 100,
        fontWeight: 'normal',
        fontFamily: 'connectionii',
        fill: '#ffffff10',
        fontSize: 408,
        charSpacing: -40,
        lineHeight: 0.7,
        left: 0,
        top: -30,
      }, textDefaults))

    canvas.add(titleTextBG)

    const titleText = new fabric.Textbox(
      `${cleanTitle}`, defu({
        top: textTop,
        width: width - 100,
        fill: '#fffffff0',
        fontSize: 80,
        left: 50,
        fontWeight: 'normal',
        fontFamily: 'Times New Roman',
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

