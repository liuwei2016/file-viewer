<template>
  <div id="app">
    <Demo msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Demo from './components/Demo.vue'

export default {
  name: 'App',
  components: {
    Demo
  }
}
</script>

<style>
html {
  overflow-y: scroll;
  font-family: helvetica, arial, sans-serif;
}

body {
  margin: 0;
  padding: 0;
}
</style>
