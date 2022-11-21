<template>
  <h1>
    Test Page
  </h1>
</template>

<script setup>
import {useHead} from '#imports'

useHead({
  title: 'Test Page',
  meta:[
    {name: 'subtitle', content: "Ayyyy, we're testing over here!" },
    {name: 'section', content: 'Tests //' },
    {name: 'description', content: 'Hellooooooo world!'}
  ]
})
</script>
