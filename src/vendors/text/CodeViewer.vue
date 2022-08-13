<template>
<div>

  <div class="text-box" v-if="type === 'md'" :class="dark ? 'code-dark' : 'code-default'">
      <pre class="hljs" :class="'language-' + language">
        <code v-html="mdToHtml(value)"></code>
      </pre>
    </div>
    <div class="text-box" v-else :class="dark ? 'code-dark' : 'code-default'">
      <pre class="hljs" :class="'language-' + language">
        <code v-html="codeToHtml(value)"></code>
      </pre>
    </div>
     <!-- <pre class="code-area">
   {{ value }}
  </pre> -->
</div>
</template>

<script>
import { highlightAuto } from 'highlight.js'
import { marked } from 'marked'
// import { cleanUrl } from 'marked/src/helpers'
export default {
  name: 'CodeEditor',
  props: {
    dark:{
      type: Boolean,
      description: '主题色',
      default:false
    },
    value: {
      type: String,
      description: '值'
    },
    type: {
      type: String,
      description: '格式'
    }
  },
  data() {
    return {
      language :''
    }

  },
  methods:{
    mdToHtml(v) {
      let result = ""
      try {
        result = marked.parse(v)
      } catch (error) {
      }
      return result
    },
    codeToHtml(v) {
      let result = ""
      try {
        let hljs = highlightAuto(v)
        this.language = hljs.language
        result = hljs.value
      } catch (error) {
      }
      return result
    },
  }
};
</script>

<style scoped>
@import './markdown.css';
@import './highlight.css';
.text-box {
  display: block;
  margin: 0 auto;
  font-size: 12px;
  padding:20px;
  box-sizing: border-box;
  min-width:500px;
  min-height: 500px;
  word-break: break-word;
  white-space: break-spaces;
  color: #444
}
</style>
