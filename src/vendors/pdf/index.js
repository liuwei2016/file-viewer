import Vue from 'vue';
import PdfView from './PdfView';

export default async function renderPdf(buffer, target,type,file) {
  console.log(buffer)
  return new Vue({
    render: h => h(PdfView, { props: { data: buffer ,file:file} }),
  }).$mount(target)
}
