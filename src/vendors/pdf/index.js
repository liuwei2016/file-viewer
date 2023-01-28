import Vue from 'vue';
// import PdfView from './PdfViewToText';
import PdfView from './PdfEmbed';
// import PdfView from './PdfView';
// import PdfView from './PdfView2';


export default async function renderPdf(buffer, target,type,file) {
  console.log(buffer)
  return new Vue({
    render: h => h(PdfView, { props: { data: buffer ,file:file} }),
  }).$mount(target)
}
