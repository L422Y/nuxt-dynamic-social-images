<template>
  <h1>
    Index Page
  </h1>
</template>

<script setup>
import {useHead} from '#imports'

useHead({
  title: 'Fancy Index Page',
  meta: [
    {name: 'subtitle', content: 'This is the subtitle'},
    {name: 'section', content: 'This is the Section'},
    {name: 'description', content: 'This is the page description...........'}
  ]
})
</script>
