<template>
  <div :class="{ hidden }">
    <div class="banner">
      <div class="container">
        <h1>
          文档压缩包预览审查系统
        </h1>
      </div>

    </div>
    <div class="container flex">

      <section style="margin-left:130px" class="box1 box">
        <el-upload class="upload-demo" drag action="/" :on-change="handleChange" :auto-upload="false"
          :file-list="fileList">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <!-- <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
        <div v-if="compressedFileNum">总共{{ compressedFileNum }}文件</div>
        <el-tree :default-expanded-keys="[2]" node-key="id" :data="treeData" :props="defaultProps">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }} _文件{{ data.id }}</span>
            <span v-if="data.size">
              <el-button type="text" size="mini">
                {{ data.size }}
              </el-button>
              <el-button style="color:darksalmon" v-if="canPreview(data)" type="text" @click="previewNodeFile(data.id)"
                size="mini">
                预览
              </el-button>
            </span>
          </span>
        </el-tree>
        <!-- 图片提取 -->
        <div class="image-cont">
          <img v-if="img" style="width:400px" :src="img" />
        </div>
        <div>

          第<el-input style="display: inline-block; width: 50px;" v-model="pageNum" size="mini" />
          页
          <!-- 文字提取 -->
          <el-button @click="extractText" size="mini" type="success">
            提取文字
          </el-button>
          <el-button @click="extractTitle" size="mini" type="info">
            提取标题
          </el-button>
          <el-button @click="extractTitle" size="mini" type="danger">
            提取链接
          </el-button>
          <el-button @click="extractTitle" size="mini" type="default">
            提取关键词
          </el-button>
          <br />
          <br />
          图片质量：
          <el-input style="display: inline-block; width: 50px;" v-model="quality" size="mini" />
          <el-button @click="getImage" size="mini" type="default">
            获得图片
          </el-button>
          <el-button @click="getCompressedImage" size="mini" type="default">
            获得压缩图片
          </el-button>
        </div>
        <div v-html="text" class="text-cont">
      </div>
      </section>

      <div class="box2 box">
      <div v-show="loading" class="well loading">正在加载中，请耐心等待...</div>
      <div v-show="!loading" class="well preview-cont" ref="output"></div>
    </div>
    </div>
  </div>
</template>

<script>
import { getExtend, readBuffer, render, isCanDealPack, getFileSize, getFileType, initPasteImage } from "@/components/util";
import { parse } from "qs";
import { getPackageInfo } from "./package";
import renders from './renders';

window._fileInfo = {} //压缩包 文件对象
console.log(render, Object.keys(renders))
const acceptTypes = Object.keys(renders)
// 将预览内容转为文字信息 
window._textInfo = [
  {
    page: 1,
    html: '',
    text: '',
    maxFontSize: 28,
    fontSizeArr: [],
    maxFontSizeInfo: {
    },
    textInfo: [
      {
        fontSize: 12,
        replaceText: '',
        text: '',
        level: '12'
      }
    ]
  }
]

function computedTextInfo(container) {
  var obj = {
    page: 1,
    html: '',
    text: '',
    maxFontSize: 28,
    fontSizeArr: [],
    maxFontSizeInfo: {
    },
    textInfo: [
      {
        fontSize: 12,
        replaceText: '',
        text: '',
        level: '12'
      }
    ]
  }
  let childNodes = container.childNodes;
  if (!childNodes.length) {
    console.log("该页面可能为影印版")
    return "没有文字"
  }
  let arrSet = new Set();
  let textInfo = []
  console.log(container, container.childNodes);

  childNodes.forEach((v, i) => {
    if (v.style && v.style.fontSize) {
      let fontSize = Math.floor(v.style.fontSize.replace('px', ''))
      let textContent = v.textContent.replace(/\r|\n|\s+/g, "")
      if (textContent) {
        textInfo.push({
          text: textContent,
          size: fontSize
        })
      }
      arrSet.add(fontSize)
    }

  })
  let textInfo2 = [];
  textInfo.forEach((v, i) => {
    let end = textInfo2[textInfo2.length - 1];
    if (end && textInfo[i].size === end.size) {
      textInfo2[textInfo2.length - 1].text += textInfo[i].text;
    } else {
      textInfo2.push(v)
    }
  })
  return {
    fontSizeArr: Array.from(arrSet),
    textInfo,
    textInfo2
  }
}

// 将对象转成树结构
function objToTree(objData, everyFileCallback) {
  let arr = []
  let count = 0;
  let id = 0;
  function objToArray(obj, arr) {
    Object.keys(obj).forEach((v, i) => {
      arr.push({ name: v, children: [], id: ++id })
      if (Object.keys(obj[v]).length !== 0) {
        objToArray(obj[v], arr[i].children)
      } else {
        count++
        if (obj[v].size) {

          if (everyFileCallback && typeof everyFileCallback === "function") {
            everyFileCallback(obj[v], id)
          }
          arr[i].size = Math.ceil(obj[v].size / 1024) + "kb"
        }
      }
    })
  }
  objToArray(objData, arr)
  return {
    dir: arr,
    count: count
  }
}
// 文件管理
function manageFile(file, fileId) {
  window._fileInfo[fileId] = file
}
/**
 * 支持嵌入式显示，基于postMessage支持跨域
 * 示例代码：
 *
 */
export default {
  name: "Demo",
  props: {
    msg: String,
  },
  data() {
    return {
      acceptTypes: acceptTypes,
      treeData: [],
      fileList: [],
      textValue: '123',
      compressedFileNum: 0, //压缩包 文件数量
      text: '', //当前文信息
      curType: '', //当前预览的格式类型
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      img: '',
      quality: 1, //图片质量
      pageNum: 1,
      // 加载状态跟踪
      loading: false,
      // 上个渲染实例
      last: null,
      // 隐藏头部，当基于消息机制渲染，将隐藏
      hidden: false,
    };
  },
  created() {
    // 允许使用预留的消息机制发送二进制数据，必须在url后添加?name=xxx.xxx&from=xxx
    const { from, name } = parse(location.search.substr(1));
    if (from) {
      window.addEventListener("message", (event) => {
        const { origin, data: blob } = event;
        if (origin === from && blob instanceof Blob) {
          // 构造响应，自动渲染
          const file = new File([blob], name, {});
          this.hidden = true;
          this.handleChange({ target: { files: [file] } });
        }
      });
    }
  },
  mounted() {
  },
  methods: {
    canPreview(data) {
      console.log(data.name)
      let type = data.name.split(".").pop()
      return acceptTypes.includes(type)
    },
    // 根据id 获取文件内容
    previewNodeFile(id) {
      console.log(id)
      let file = window._fileInfo[id]
      if (file) {
        this.previewFile(file)
      }
    },
    // 获取压缩包信息
    async getPackageInfo(file) {
      let obj = null;
      try {
        obj = await getPackageInfo(file);
      } catch (e) {
        console.error(e);
      } finally {
        window._package = obj;
      }
      return obj
    },
    // 预览文件
    async previewFile(file) {
      this.curType = getFileType(file).toLowerCase()
      try {
        const arrayBuffer = await readBuffer(file);
        this.loading = false;
        this.last = await this.displayResult(arrayBuffer, file);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    // 预览压缩包
    async previewPackage(file) {
      try {
        let data = await this.getPackageInfo(file)
        let info = objToTree(data, manageFile)
        window._pack_info = info;
        this.treeData = info.dir[0].children
        this.compressedFileNum = info.count;
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    handleChange(fileObj) {
      this.loading = true;
      this.treeData = [];
      this.compressedFileNum = 0;

      this.fileList = [fileObj];
      const file = fileObj.raw
      console.log(getFileType(file), getFileSize(file))
      if (isCanDealPack(file)) {
        this.previewPackage(file)
      } else {
        this.previewFile(file)
      }
    },
    displayResult(buffer, file) {
      // 取得文件名
      const { name } = file;
      // 取得扩展名
      const extend = getExtend(name).toLowerCase();
      console.log(name, extend)
      // 输出目的地
      const { output } = this.$refs;
      // 生成新的dom
      const node = document.createElement("div");
      // 添加孩子，防止vue实例替换dom元素
      if (this.last) {
        console.log("删除", this.last.$el);
        output.removeChild(this.last.$el);
        this.last.$destroy();
      }
      const child = output.appendChild(node);
      // 调用渲染方法进行渲染
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          render(buffer, extend, child, file).then(resolve).catch(reject)
        }, 300)
      );
    },
    extractText() {
      var text = document.querySelector(".preview-cont").textContent
      // var textArr = text.split("\n").filter((v) => { return v.trim().length > 0 });
      // // text = text.replace(/\n/g,"<br/>")
      // this.text = textArr.join("");
      this.text = text;
    },


    extractTitle() {
      let embed = document.querySelector(".vue-pdf-embed");

      if (embed) {
        let page = embed.childNodes[2];
        let textLayer = page.querySelector(".textLayer");

        let result = computedTextInfo(textLayer)
        console.log(result);
      }
    },
    getImage() {
      let embed = document.querySelector(".vue-pdf-embed");
      if (embed) {
        let page = embed.childNodes[this.pageNum - 1];
        let canvas1 = page.querySelector("canvas");
        if (canvas1.getContext) {
          //  var ctx = canvas1.getContext("2d");                
          var myImage = canvas1.toDataURL("image/jpeg", Number(this.quality));
          this.img = myImage
          console.log(myImage);
        }
      }
    },
    getCompressedImage() {
      let embed = document.querySelector(".vue-pdf-embed");
      if (embed) {
        let page = embed.childNodes[2];
        let textLayer = page.querySelector(".textLayer");

        let result = computedTextInfo(textLayer)
        console.log(result);
      }
    }

  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.upload-demo {
  margin: 10px auto;
  text-align: center;
}

.flex {
  display: flex;
}

.flex .box {
  flex: 1;
}

.banner {
  overflow: auto;
  text-align: center;
  /* background-color: #12b6ff; */
  color: #000;
}

.hidden .banner {
  display: none;
}

.hidden .well {
  height: calc(100vh - 12px);
}

.file-select {
  position: absolute;
  left: 5%;
  top: 17px;
  margin-left: 20px;
}

.banner div {
  color: #000;
}

.banner h1 {
  font-size: 20px;
  line-height: 2;
  margin: 0.5em 0;
}

.well {
  display: block;
  background-color: #fff;
  border: 1px dashed #eee;
  border-radius: 4px;
  margin: 5px;
  width: calc(100% - 12px);
  height: calc(100vh - 74px);
  overflow: auto;
}

.loading {
  text-align: center;
  padding-top: 50px;
}

.messages .warning {
  color: #cc6600;
}
</style>

<style>
.pptx-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.image-cont img {
  max-width: 500px;
}
</style>
