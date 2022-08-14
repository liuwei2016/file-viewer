import {Archive} from '../lib/libarchive';
// import { File, FileReader, crypto } from '../lib/shim/browser.js';
if (typeof window !== 'undefined') {
    // browser environment
    window.Archive = Archive;
    
    Archive.init({
        workerUrl: '/dist/worker-bundle.js'
    });
} else {
    Archive.init();
}
// 压缩包是否加密 true || false
export async function hasEncryptedData(file){
    const archive = await Archive.open(file);
    return  await archive.hasEncryptedData();
}
// 移除mac压缩包缩略信息
function removeMacInfo(obj){
    if(obj["__MACOSX"]){
        delete obj["__MACOSX"]
    }
    return obj
}
// 获取解压后的压缩包信息
// outputs
// {
//     ".gitignore": {File},
//     "addon": {
//         "addon.py": {File},
//         "addon.xml": {File}
//     },
//     "README.md": {File}
// }
export async function getPackageInfo(file) {
    let obj = null;
    const archive = await Archive.open(file);
    obj = await archive.extractFiles();
    console.log(obj)
    removeMacInfo(obj)
    return { 
        extractInfo: obj,
        // filesInfo:filesObj
    };
}

// 获取压缩包信息，文件未解压的
// outputs
// {
//     ".gitignore": {CompressedFile},
//     "addon": {
//         "addon.py": {CompressedFile},
//         "addon.xml": {CompressedFile}
//     },
//     "README.md": {CompressedFile}
// }


export async function getCompressedPackageInfo(file) {
    let obj = null;
    const archive = await Archive.open(file);
    obj = await archive.getFilesObject();
    return { 
        filesInfo: obj,
    };
}

export async function runTest(file) {

    let obj = null;
    const archive = await Archive.open(file);
    //console.log( await archive.getFilesObject() );
    //console.log( await archive.getFilesArray() );
    obj = await archive.extractFiles();
    const filesObj = await archive.getFilesObject();
    //console.log( await archive.getFilesObject() );
    //console.log( await archive.getFilesArray() );
    // obj = await fileChecksums(obj);
    console.log(filesObj.testUI.src.com.android.testUI,3333)
    var ui =filesObj.testUI.src.com.android.testUI
    // const file = await ui['MyScrollView.java'].extract();
    // console.log(file);
    return filesObj;
}