<template>
  <div :class="{ hidden }">
    <div class="banner">
      <div class="container">
        <h1>
          <div>
            智能文档或者压缩包查看
            <input class="file-select" type="file" @change="handleChange" />
          </div>
        </h1>
      </div>

    </div>
    <div class="container flex">

      <div class="box1 box">
        <el-tree :default-expanded-keys="[2]" node-key="id" :data="treeData" :props="defaultProps">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span>{{ node.label }} _ {{ data.id }}</span>
            <span v-if="data.size">
              <el-button type="text" size="mini">
                {{ data.size }}
              </el-button>
              <el-button type="text" @click="previewNodeFile(data.id)" size="mini">
                预览
              </el-button>
            </span>
          </span>
        </el-tree>
      </div>
      <div class="box2 box">
        <div v-show="loading" class="well loading">正在加载中，请耐心等待...</div>
        <div v-show="!loading" class="well" ref="output"></div>
      </div>




    </div>
  </div>
</template>

<script>
import { getExtend, readBuffer, render, isCanDealPack, getFileSize, getFileType } from "@/components/util";
import { parse } from "qs";
import { getPackageInfo } from "./package";
window._fileInfo = {}

function objToTree(objData) {
  let arr = []
  let node = 0;
  let id = 0;
  function objToArray(obj, arr) {
    Object.keys(obj).forEach((v, i) => {
      arr.push({ name: v, children: [], id: ++id })
      if (Object.keys(obj[v]).length !== 0) {
        objToArray(obj[v], arr[i].children)
      } else {
        node++
        if (obj[v].size) {
          window._fileInfo[id] = obj[v]
          arr[i].size = Math.ceil(obj[v].size / 1024) + "k"
        }
      }
    })

  }
  objToArray(objData, arr)
  return {
    dir: arr,
    count: node
  }
}

// var result = objToTree(objData)
// console.log(result ,"33344")
/**
 * 支持嵌入式显示，基于postMessage支持跨域
 * 示例代码：
 *
 */
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
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
  methods: {
    // 根据id 获取文件内容
    previewNodeFile(id) {
      console.log(id)
      let file = window._fileInfo[id]
      if(file){
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
        let info = objToTree(data)
        window._pack_info = info;
        this.treeData = info.dir[0].children
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    handleChange(e) {
      this.loading = true;
      const [file] = e.target.files;
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
      console.log(name,extend)
      // 输出目的地
      const { output } = this.$refs;
      // 生成新的dom
      const node = document.createElement("div");
      // 添加孩子，防止vue实例替换dom元素
      if (this.last) {
        output.removeChild(this.last.$el);
        this.last.$destroy();
      }
      const child = output.appendChild(node);
      // 调用渲染方法进行渲染
      return new Promise((resolve, reject) =>
        render(buffer, extend, child).then(resolve).catch(reject)
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  border: 1px solid #ccc;
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
</style>
