import { createWriteStream, existsSync, readFileSync } from "fs";
import path from "path";
import { appendHeader, defineEventHandler, getQuery } from "h3";
import { fabric } from "fabric";
import defu from "defu";
import { useRuntimeConfig } from "#imports";
const { resolve } = path;
const config = useRuntimeConfig();
const { Image, Rect, StaticCanvas, Textbox } = fabric;
let imageRenderer;
const _DSIGenerator = class {
  constructor() {
    try {
    } catch (err) {
    }
  }
  static getInstance() {
    this._instance = this._instance ? this._instance : new _DSIGenerator();
    return this._instance;
  }
  static async getMetaData(data) {
    const html = await data.text();
    let matches = html.matchAll(/<meta[^>]+(name|property)="([^")]*)[^>]+content="([^"]*).*?>/gm);
    let title = html.matchAll(/<title>(.*)<\/title>/gm)?.next()?.value;
    title = title[1] ? title[1] : false;
    const values = {};
    for (const m of matches) {
      values[m[2].toString()] = m[3];
    }
    matches = html.matchAll(/<img src="([^"]+)"/gm);
    const images = [...matches].map((m) => m[1]);
    return {
      title,
      images,
      cleanTitle: values["clean:title"] || values.title || title,
      subTitle: values["clean:subtitle"] || values.subtitle,
      section: values["clean:section"] || values.section,
      desc: values["og:description"] || values.description
    };
  }
  async eventHandler(event) {
    const options = config.public.dsi;
    const query = getQuery(event);
    const __dirname2 = resolve("");
    if (query?.path) {
      const path2 = query.path.toString();
      const cachePath = `${options.cacheDir}`;
      let pfn = path2.replaceAll("/", "__");
      pfn = resolve(cachePath, `${pfn}.jpg`);
      let jpg;
      if (!existsSync(pfn) || process.dev) {
        const source = `http://${event.req.headers.host}${path2}`;
        const width = 1200;
        const height = 628;
        if (config.public.dsi?.fonts && fabric.nodeCanvas) {
          for (const font of config.public.dsi?.fonts) {
            fabric.nodeCanvas.registerFont(`${__dirname2}/${font.path}`, font.options);
          }
        }
        const canvas = new StaticCanvas(null, { width, height, backgroundColor: "#000000" });
        const {
          cleanTitle,
          subTitle,
          section,
          title,
          desc,
          images
        } = await fetch(source).then(_DSIGenerator.getMetaData);
        const textDefaults = _DSIGenerator.textDefaults;
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
        });
        canvas.renderAll();
        jpg = await canvas.createJPEGStream();
        await jpg.pipe(createWriteStream(pfn));
      } else {
        jpg = readFileSync(pfn);
      }
      appendHeader(event, "Content-Type", "image/jpeg");
      return jpg;
    }
  }
};
let DSIGenerator = _DSIGenerator;
DSIGenerator.textDefaults = {
  styles: {},
  fontFamily: "Arial",
  fill: "#ffffff",
  fontSize: 12,
  left: 50,
  top: 50,
  lineHeight: 0.8,
  textAlign: "left",
  lockRotation: true
};
const socialImage = DSIGenerator.getInstance();
export default defineEventHandler(socialImage.eventHandler);
const defaultImageRenderer = async ({
  fabric: fabric2,
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
    fontFamily: "arial",
    fill: "#ffffff",
    fontSize: 12,
    left: 50,
    top: 50,
    lineHeight: 0.8,
    textAlign: "left",
    lockRotation: true
  };
  if (images?.length > 0) {
    let imgPath = images[0];
    if (imgPath && imgPath.includes("assets")) {
      imgPath = imgPath.split("assets/")[1];
      imgPath = `file://${__dirname}/public/assets/${imgPath}`;
      const img = await new Promise((resolve2, reject) => {
        fabric2.Image.fromURL(
          imgPath,
          (img2) => {
            img2.scaleToHeight(height);
            img2.scaleToWidth(width);
            img2.filters.push(new fabric2.Image.filters.Blur({ blur: 0.33 }));
            img2.applyFilters();
            resolve2(img2);
          },
          {
            opacity: 0.6
          }
        );
      });
      canvas.add(img);
      canvas.centerObject(img);
    }
  }
  let textTop = 30;
  const bioText = new fabric2.Textbox(
    options.fixedText || "",
    defu({
      top: textTop,
      width: width - 100,
      fill: "#fffffffb",
      fontSize: 32,
      fontWeight: "100"
    }, textDefaults)
  );
  textTop += 90;
  const bgBoxTop = new fabric2.Rect({
    width: 1200,
    height: (bioText.height || 0) + 60,
    fill: "#00000050",
    left: 0,
    top: 0
  });
  canvas.add(bgBoxTop);
  canvas.add(bioText);
  if (section) {
    const sectTitle = new fabric2.Textbox(
      `${section}`,
      defu({
        width: width - 300,
        fill: "#ffffff90",
        fontSize: 28,
        left: 50,
        lineHeight: 1.2,
        top: textTop
      }, textDefaults)
    );
    canvas.add(sectTitle);
    textTop += sectTitle.height || 0;
  }
  const titleTextBG = new fabric2.Textbox(
    `${cleanTitle}`,
    defu({
      width: width - 100,
      fontWeight: "normal",
      fill: "#ffffff10",
      fontSize: 408,
      charSpacing: -40,
      lineHeight: 0.7,
      left: 0,
      top: -30
    }, textDefaults)
  );
  canvas.add(titleTextBG);
  if (cleanTitle) {
    const titleText = new fabric2.Textbox(
      `${cleanTitle}`,
      defu({
        top: textTop,
        width: width - 100,
        fill: "#fffffff0",
        fontSize: 80,
        left: 50,
        fontWeight: "bold"
      }, textDefaults)
    );
    canvas.add(titleText);
    textTop += titleText.height || 0;
  }
  if (subTitle) {
    const subTitleText = new fabric2.Textbox(
      `${subTitle}`,
      defu({
        top: textTop,
        width: width - 100,
        fill: "#fffffff0",
        fontSize: 25,
        left: 50
      }, textDefaults)
    );
    canvas.add(subTitleText);
    textTop += 80 + (subTitleText.height || 0);
  } else {
    textTop += 80 + 20;
  }
  if (desc) {
    const bgBox = new fabric2.Rect({
      width: 1200,
      height: height - textTop + 120,
      fill: "#00000050",
      left: 0,
      top: textTop - 50
    });
    canvas.add(bgBox);
    const descText = new fabric2.Textbox(
      `${desc}`,
      defu({
        width: width - 300,
        fill: "#ffffffaa",
        fontSize: 32,
        left: 50,
        lineHeight: 1.2,
        top: textTop
      }, textDefaults)
    );
    canvas.add(descText);
  }
};
if (config.public.dsi?.customHandler) {
  const rendererPath = config.public.dsi.customHandler;
  const ch = await import(resolve(rendererPath));
  imageRenderer = ch.default;
} else {
  imageRenderer = defaultImageRenderer;
}
