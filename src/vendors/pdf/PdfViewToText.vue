<template>
  <div class="home_wrap">
    <div class="pdf_down">
      <div class="pdf_set_left" @click="scaleD()">➕</div>
      <div class="pdf_set_middle" @click="scaleX()">➖</div>
      <!-- <div class="pdf-pre" @click="prePage">上一页</div> -->
      <!-- <div class="pdf-next" @click="nextPage">下一页</div> -->
    </div>
    <div id="pageContainer" :style="{ width: pdf_div_width, margin: '0 auto' }">
    </div>
  </div>
</template>

<script>
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
// const PDFJS = { GlobalWorkerOptions: {} };

const PAGE_SCALE = 1.5;
const SVG_NS = "http://www.w3.org/2000/svg";
function buildSVG(viewport, textContent) {
  // Building SVG with size of the viewport (for simplicity)
  const svg = document.createElementNS(SVG_NS, "svg:svg");
  svg.setAttribute("width", viewport.width + "px");
  svg.setAttribute("height", viewport.height + "px");
  // items are transformed to have 1px font size
  svg.setAttribute("font-size", 1);

  // processing all items
  textContent.items.forEach(function (textItem) {
    // we have to take in account viewport transform, which includes scale,
    // rotation and Y-axis flip, and not forgetting to flip text.
    const tx = pdfjsLib.Util.transform(
      pdfjsLib.Util.transform(viewport.transform, textItem.transform),
      [1, 0, 0, -1, 0, 0]
    );
    const style = textContent.styles[textItem.fontName];
    // adding text element
    const text = document.createElementNS(SVG_NS, "svg:text");
    text.setAttribute("transform", "matrix(" + tx.join(" ") + ")");
    text.setAttribute("font-family", style.fontFamily);
    text.textContent = textItem.str;
    svg.append(text);
  });
  return svg;
}


async function pageLoadedFn(pdfDocument, pageNumber, pageContainer) {
  // Loading document and page text content
  const page = await pdfDocument.getPage(pageNumber);
  const viewport = page.getViewport({ scale: PAGE_SCALE });
  const textContent = await page.getTextContent();
  // building SVG and adding that to the DOM
  const svg = buildSVG(viewport, textContent);
  pageContainer.append(svg);
  // Release page resources.
  page.cleanup();
}

async function pageLoadedBySVGGraphics(pdfDocument,pageNumber,pageContainer) {
  const page = await pdfDocument.getPage(pageNumber);
  /* svg实现方式 */
  let viewport = page.getViewport(1)
  console.log(pageNumber)
  pageContainer.id = 'canvas_' + pageNumber
  // pageContainer.className = 'pageContainer'
  pageContainer.style.width = viewport.width + 'px'
  pageContainer.style.height = viewport.height + 'px'
  return page.getOperatorList().then(function (opList) {
    let svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs)
    return svgGfx.getSVG(opList, viewport).then(function (svg) {
      pageContainer.appendChild(svg)
    })
  })
}



pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.entry.js");

export default {
  name: "PdfView",
  props: {
    data: ArrayBuffer,
    file: File
  },
  data() {
    return {
      pdf_scale: 1.0, //pdf放大系数
      pdf_pages: [],
      pdf_div_width: "",
      currentPage: 1,
    };
  },
  mounted() {
    this.loadFile();
  },
  methods: {
    async loadFile() {
      //初始化pdf
      console.log("初始化pdf");
      // if(!this.data) return ;
      this.pdfDoc = await pdfjsLib.getDocument(this.data).promise;
      this.pdf_pages = this.pdfDoc.numPages;
      this.$nextTick(async () => {
        await this.renderPage(this.pdfDoc)
      });
    },
    async renderPage(pdfDocument) {
      // let pdfDocument = await initPdfDocument()
      window.pdfDocument = pdfDocument
      let totalPage = pdfDocument._pdfInfo.numPages || 1;
      let container = document.getElementById("pageContainer")
      container.innerHTML = ''

      for (var i = 0; i < Math.min(totalPage, 12); i++) {
        let div = document.createElement("div")
        div.className = "pdf-page"
        container.appendChild(div)
      }
      let pages = document.querySelectorAll(".pdf-page");

      pages.forEach(async (v, i) => {
        // await pageLoadedFn(pdfDocument, i + 1, v)
        await pageLoadedBySVGGraphics(pdfDocument, i + 1, v)
        
      })
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
