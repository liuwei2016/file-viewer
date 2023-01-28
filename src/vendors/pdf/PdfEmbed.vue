<template>
  <div class="box">
    <vue-pdf-embed v-if="pdfUrl " :source="pdfUrl" />
  </div>
</template>

<script>
import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'
export default {
  name: "PdfEmbed",
  props: {
    data: ArrayBuffer,
    file:File
  },
  components:{
    VuePdfEmbed
  },
  data(){
    return {
        pdfUrl :null
    }
  },
  mounted() {
    this.pdfUrl = this.createdUrl(this.file)
    console.log(this.pdfUrl)
  },
  methods: {
    createdUrl(file){
     const fileType =file.type
     const blob = new Blob([file], { type: fileType || 'application/*' })
     const blobUrl = window.URL.createObjectURL(blob)
     return blobUrl
    }
  },
}
</script>

<style lang="less" scoped>
 
 
</style>