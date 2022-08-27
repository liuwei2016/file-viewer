<template>
  <div class="home_wrap">
    <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="100%"  style="border: none; min-height:500px; background:#ac0;">
      This browser does not support PDFs. Please download the PDF to view it: <a href="/index.pdf">Download PDF</a>
    </iframe>
  </div>
</template>

<script>
export default {
  name: "PdfView",
  props: {
    data: ArrayBuffer,
    file:File
  },
  data() {
    return {
      pdfUrl :null,
    };
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
};
</script>

<style scoped>
.home_wrap {
  width: 100%;
  height: 100%;
}

.home_wrap .pdf_down {
  position: fixed;
  display: flex;
  z-index: 20;
  right: 26px;
  bottom: 7%;
  cursor: pointer;
}

.home_wrap .pdf-pre {
  position: fixed;
  display: flex;
  z-index: 20;
  right: 160px;
  bottom: 9%;
  cursor: pointer;
}

.home_wrap .pdf-next {
  position: fixed;
  display: flex;
  z-index: 20;
  right: 100px;
  bottom: 9%;
}

.home_wrap .pdf_down .pdf_set_left {
  width: 30px;
  height: 40px;
  color: #408fff;
  font-size: 15px;
  padding-top: 25px;
  text-align: center;
  margin-right: 5px;
  cursor: pointer;
}

.home_wrap .pdf_down .pdf_set_middle {
  width: 30px;
  height: 40px;
  color: #408fff;
  font-size: 15px;
  padding-top: 25px;
  text-align: center;
  margin-right: 5px;
  cursor: pointer;
}
</style>
