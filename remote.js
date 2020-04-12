var remote = require('electron').remote;

var max = false

function maxWindow() {
    if (!max) {
        remote.getCurrentWindow().maximize();
    } else {
        remote.getCurrentWindow().unmaximize();
    }
    max = !max;
}