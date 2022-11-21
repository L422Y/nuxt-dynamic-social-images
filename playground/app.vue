<template>
  <nav>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/test">Test</NuxtLink>
  </nav>
  <NuxtPage/>
  <div>
    Config:
    <p>{{ config }}</p>
  </div>
  <div>
    Image:
    <p><img :src="`${config.path}?path=${$route.fullPath}`" width="600"/></p>
  </div>
</template>
<style>
  nav {
    display: flex;
    gap:1rem
  }
</style>
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
