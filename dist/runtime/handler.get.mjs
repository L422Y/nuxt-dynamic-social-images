import * as fs from "fs";
import { createWriteStream, existsSync, mkdir, readFileSync } from "fs";
import { appendHeader, defineEventHandler, getQuery } from "h3";
import { fabric } from "fabric";
import defu from "defu";
import { createResolver } from "@nuxt/kit";
import { useRuntimeConfig } from "#imports";
import path from "path";
const resolver = createResolver("~");
const config = useRuntimeConfig();
const options = config.public.dsi;
let imageRenderer;
const cachePath = resolver.resolve(`${options.cacheDir}`);
try {
  if (existsSync(cachePath)) {
    fs.rmSync(cachePath, { force: true, recursive: true });
  }
  mkdir(cachePath, { recursive: true }, (err) => {
  });
} catch (err) {
}
console.log("cachePath", cachePath);
if (process.env.fontsLoaded !== "true") {
  if (options?.fonts && fabric.nodeCanvas) {
    for (const font of options?.fonts) {
      const fPath = path.resolve(font.path);
      try {
        console.log("font", fPath);
        fabric.nodeCanvas.registerFont(fPath, font.options);
      } catch (err) {
        console.error(err);
      }
    }
  }
  process.env.fontsLoaded = "true";
}
class DSIGenerator {
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
    const images = [...matches].map((m) => m[1]).filter((v) => v.toLowerCase().match(/(.jpg|.png|.gif)$/));
    return {
      title,
      images,
      cleanTitle: values["clean:title"] || values.title || title,
      subTitle: values["clean:subtitle"] || values.subtitle,
      section: values["clean:section"] || values.section,
      desc: values["og:description"] || values.description
    };
  }
}
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
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (query?.path) {
    const path2 = query.path.toString();
    const host = event.node.req.headers.host || "127.0.0.1:3000";
    const url = `http://${host}`;
    const source = `${url}${path2}`;
    let pfn = path2.replaceAll("/", "__");
    pfn = resolver.resolve(cachePath, `${pfn}.jpg`);
    let jpg;
    if (!existsSync(pfn) || process.dev) {
      const width = 1200;
      const height = 628;
      const canvas = new fabric.StaticCanvas(null, { width, height, backgroundColor: "#000000" });
      const response = await fetch(source).then(DSIGenerator.getMetaData).catch((err) => console.error(err));
      const {
        cleanTitle,
        subTitle,
        section,
        title,
        desc,
        images
      } = response;
      const textDefaults = DSIGenerator.textDefaults;
      await imageRenderer(
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
        images,
        url
      );
      canvas.renderAll();
      jpg = await canvas.createJPEGStream();
      await jpg.pipe(createWriteStream(pfn));
    } else {
      jpg = readFileSync(pfn);
    }
    appendHeader(event, "Content-Type", "image/jpeg");
    return jpg;
  }
});
const defaultImageRenderer = async (fabric2, options2, canvas, width, height, textDefaults, cleanTitle, subTitle, section, title, desc, images, url) => {
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
    if (imgPath) {
      if (imgPath.startsWith("/_ipx")) {
        imgPath = imgPath.split("/").splice(3).join("/");
      }
      imgPath = createResolver("public").resolve(imgPath);
      const img = await new Promise((resolve, reject) => {
        fabric2.Image.fromURL(
          `file://${imgPath}`,
          (img2) => {
            if (img2) {
              img2.scaleToHeight(height);
              img2.scaleToWidth(width);
              img2.filters.push(new fabric2.Image.filters.Blur({ blur: 0.33 }));
              img2.applyFilters();
            }
            resolve(img2);
          },
          {
            opacity: 0.6
          }
        );
      });
      if (img) {
        canvas.add(img);
        canvas.centerObject(img);
      }
    }
  }
  let textTop = 30;
  const bioText = new fabric2.Textbox(
    options2.fixedText || "",
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
  const ch = await import(createResolver(".").resolve(rendererPath));
  imageRenderer = ch.default;
} else {
  imageRenderer = defaultImageRenderer;
}
