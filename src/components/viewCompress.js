import { Archive } from '../lib/libarchive.js';

import { File, FileReader, crypto } from '../lib/shim/browser.js';

if (typeof window !== 'undefined') {
    // browser environment
    window.Archive = Archive;

    Archive.init({
        workerUrl: '../../dist/worker-bundle.js'
    });
} else {
    Archive.init();
}