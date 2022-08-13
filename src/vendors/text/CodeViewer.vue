<template>
  <pre class="code-area">
    {{ value }}
  </pre>
</template>

<script>
export default {
  name: 'CodeEditor',
  props: {
    value: {
      type: String,
      description: '值'
    }
  },
};
</script>

<style scoped>
.code-area {
  display: block;
  margin: 0 auto;
  font-size: 12px;
  padding:20px;
  box-sizing: border-box;
  width: 1000px;
  min-height: 500px;
  background: #f6f6f6;
  word-break: break-word;
  white-space: break-spaces;
  color: #444
}
</style>
