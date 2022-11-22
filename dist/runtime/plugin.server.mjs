import { defineNuxtPlugin, useState } from "#app";
export default defineNuxtPlugin(() => {
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
