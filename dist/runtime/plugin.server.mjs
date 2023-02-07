import path from "path";
import { defineNuxtPlugin, useRuntimeConfig, useState } from "#app";
import { fabric } from "fabric";
export default defineNuxtPlugin(() => {
  const options = useRuntimeConfig().public.dsi;
  if (process.env.fontsLoaded !== "true") {
    if (options?.fonts && fabric.nodeCanvas) {
      for (const font of options?.fonts) {
        const fPath = path.resolve(font.path);
        fabric.nodeCanvas.registerFont(fPath, font.options);
      }
    }
    process.env.fontsLoaded = "true";
  }
  return {
    provide: {
      dsi: {
        values: useState("dsi", () => {
          return {};
        })
      }
    }
  };
});
