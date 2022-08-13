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

export async function getPackageInfo(file) {
    let obj = null;
    const archive = await Archive.open(file);
    //console.log( await archive.getFilesObject() );
    //console.log( await archive.getFilesArray() );
    // const filesObj = await archive.getFilesObject();
    obj = await archive.extractFiles();

    //console.log( await archive.getFilesObject() );
    //console.log( await archive.getFilesArray() );
    // obj = await fileChecksums(obj);
    // console.log(filesObj.testUI.src.com.android.testUI,3333)
    // var ui =filesObj.testUI.src.com.android.testUI
    // const file = await ui['MyScrollView.java'].extract();
    // console.log(file);
    return { 
        extractInfo: obj,
        // filesInfo:filesObj
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