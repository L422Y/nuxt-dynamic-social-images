# Nuxt DSI (Dynamic Social Images)

Sets up an endpoint (default: `/socialImage`) that takes a `path` GET parameter and will generate a dynamic social share image based on specified meta tags, and other configuration.

The path parameter tells the module what path on the website you are rendering the image for, i.e.:
`/socialImage?path=/blog/my-first/post`

Generated images are cached, and the cache is cleared when your application restarts.

This module works well with [nuxt-head-ex](https://www.npmjs.com/package/nuxt-head-ex) :)

# Installation
```shell
yarn add nuxt-dsi
```

# Configuration

Add the module to your `nuxt.config.ts` and add optional configuration:
```js
export default defineNuxtConfig({
  modules: [
    'nuxt-dsi'
  ],
  dsi: {
    // where the image endpoint will listen
    path: '/socialImage',
    // static text placed at the top of the image
    fixedText: 'Nuxt: Dynamic Social Images',
    // set your custom render handler/function
    customHandler: 'playground/src/dsi-handler.mjs',
    // set up your custom fonts
    fonts: [
      { path: 'playground/fonts/ConnectionIi-2wj8.otf', 
        options: { family: 'connectionii' } },
      { path: 'playground/fonts/Barlow/Barlow-thin.ttf', 
        options: { family: 'barlowthin', fontWeight: '100' } }
    ]
  }
})
```

In your `app.vue`, set up your default `og:image` reflectively:
```js
<script setup>
  import {useHead} from "#head"
  import {useRoute, useRuntimeConfig} from "#app";

  const config = useRuntimeConfig().public.dsi
  const route = useRoute()
  
  useHead({
    meta: [
        {
          property: 'og:image',
          content: () => `${config.path}?path=${route.fullPath}`
        }
    ]
  })

</script>

```

See fabric's [registerFont](http://fabricjs.com/fabric-intro-part-4#custom-fonts) method to learn more about configuring fonts.


## Extending / Customization
You can check out the [playground/src/dsi-handler.mjs](./playground/src/dsi-handler.mjs) for an example on how to add your own render function that overrides the default, giving you complete control over what your cards look like!

If you want to use 'clean' versions of strings (i.e. a barebones title like "Homepage" instead of "MySite: Homepage"), you can specify the meta tag as such:
```js
useHead({
  title: 'This is my Test Page',
  meta:[
    {name: 'clean:title', content: "Test Page" },
  ]
})
```
## Examples

<img src="https://l422y.com/socialImage?path=/projects/personal/kointel-bsc-wallet-tracker">
<img src="https://l422y.com/socialImage?path=/">
<img src="https://l422y.com/socialImage?path=/blog">
<img src="https://l422y.com/socialImage?path=/blog/reverse-clamp">

## Development

- Run `npm run dev:prepare` to generate type stubs.
- Use `npm run dev` to start [playground](./playground) in development mode.


## Credits

Made with 💚 by [Larry Williamson](https://l422y.com) / @l422y
