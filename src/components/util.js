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
export function getFileSize(file){
 return  Math.floor(file.size/1024) +"k"
}