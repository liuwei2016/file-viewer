import renders from './renders';

export async function readBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = loadEvent => resolve(loadEvent.target.result);
    reader.onerror = e => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

export async function readDataURL(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = loadEvent => resolve(loadEvent.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(new Blob([buffer]));
  });
}

export async function readText(buffer) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = loadEvent => resolve(loadEvent.target.result);
    reader.onerror = e => reject(e);
    reader.readAsText(new Blob([buffer]), 'utf-8');
  });
}

export function getExtend(name) {
  const dot = name.lastIndexOf('.')
  return name.substr(dot + 1);
}

 

export async function render(buffer, type, target) {
  const handler = renders[type];
  if (handler) {
    return handler(buffer, target,type);
  }
  return renders.error(buffer, target, type);
}

export function getFileType(file){
   var type = file.name.split(".").pop() || "unKnow"
   return  type
}
export function isCanDealPack(file){
  const curType = getFileType(file);
  return ["zip","rar","7z"].includes(curType)
}
// 展示压缩包
function displayPackage(){

}

// 剪贴板内容获取 
export async function getClipboard() {
  const clipboardItems = await navigator.clipboard.read();
  for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
          const blob = await clipboardItem.getType(type);
          console.log(URL.createObjectURL(blob));
      }
  }
};
//base64ByBlob 
const base64ByBlob = (base64, callback) => {
  let arr = base64.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  console.log(new Blob([u8arr], { type: mime }));
  callback(new Blob([u8arr], { type: mime }));
};

//Blob -> Base64（利用 FileReader）
function blobToDataURI(blob, callback) {
  var reader = new FileReader();
  reader.onload = function (e) {
      callback(e.target?.result);
  };
  reader.readAsDataURL(blob);
}
// fileByBase64 
export const fileByBase64 = (file, callback) => {
  const reader = new FileReader();
  // 传入一个参数对象即可得到基于该参数对象的文本内容
  reader.readAsDataURL(file);
  reader.onload = function(e) {
      // target.result 该属性表示目标对象的 DataURL
      console.log(e.target.result);
      callback(e.target.result);
  };
};

export function getFileSize(file){
 return  Math.floor(file.size/1024) +"kb"
}

export function  initPasteImage(callback){
  function handlerPaste(event) {
    let items = event.clipboardData && event.clipboardData.items;
    console.log('items', items);
    let file = null;
    if (items && items.length) {
        // 检索剪切板 items
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                // 此时file就是剪切板中的图片文件
                file = items[i].getAsFile();
                break;
            }
        }
    }
    const url = window.URL.createObjectURL(file);
    console.log('url', url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      callback(img,url)
    };
}
document.addEventListener('paste', handlerPaste);
}