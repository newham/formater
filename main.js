var electron = require('electron');
const { app, Menu } = require('electron')
var BrowserWindow = electron.BrowserWindow;
var mainWindow = null;

function buildMenu() {
    if (process.platform === 'darwin') {
        const template = [
            {
                label: "Application",
                submenu: [
                    { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
                ]
            },
            {
                label: "Edit",
                submenu: [
                    { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                    { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                    { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                    { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                    { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
                ]
            }
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    } else {
        Menu.setApplicationMenu(null)
    }
}

function openWindow() {
    buildMenu();
    openMain();
}

function openMain() {
    if (mainWindow == null) {
        //设置窗口大小等参数
        mainWindow = new BrowserWindow({
            icon: "icon.ico",
            width: 520,
            height: 716,
            resizable: false,
            title: '格式化&翻译',
        })
        //首页
        mainWindow.loadFile('index.html');
        //注册关闭事件
        mainWindow.on('closed', () => {
            mainWindow = null;
        })
    }
}

app.on('ready', function () {
    openWindow();
})

app.on('activate', function () {
    openWindow();
})

app.on('window-all-closed', () => {
    app.quit()
})

// 关闭所有窗口后退出程序
// app.on('window-all-closed', () => {
//     app.quit()
// })