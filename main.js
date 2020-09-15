var electron = require('electron');
const { app, Menu } = require('electron')
var BrowserWindow = electron.BrowserWindow;
var mainWindow = null;
var os = require('os')

// app.disableHardwareAcceleration(); //debug: AVDCreateGPUAccelerator: Error loading GPU renderer

function buildMenu() {
    if (isMacOS()) {
        const template = [{
                label: "Formater",
                submenu: [
                    { label: "退出", accelerator: "Command+Q", click: function() { app.quit(); } },
                    { type: 'separator' },
                    {
                        label: '关于',
                        click: function() {
                            app.showAboutPanel()
                        }
                    },

                ]
            },
            {
                label: "编辑",
                submenu: [
                    { label: "复制", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                    { label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                    { label: '下一步', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                    { label: '上一步', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                    { label: "全选", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
                ]
            }
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template))
    } else {
        Menu.setApplicationMenu(null)
    }
}

function isMacOS() {
    return os.type() === 'Darwin'
}

function isWin() {
    return os.type() === 'Windows_NT'
}

function isLinux() {
    return os.type() === 'Linux'
}

function openWindow() {
    buildMenu();
    openMain();
}

function openMain() {
    if (mainWindow == null) {
        //设置窗口大小等参数
        mainWindow = new BrowserWindow({
            // titleBarStyle: 'hidden',
            titleBarStyle: "hiddenInset",
            icon: "icon.ico",
            width: 900,
            minWidth: 600,
            height: 600,
            minHeight: 300,
            resizable: true,
            title: '格式化&翻译',
            webPreferences: {
                nodeIntegration: true, // 是否集成Nodejs
            }
        })

        //首页
        if (isWin()) {
            mainWindow.loadFile('index_win.html');
        } else {
            mainWindow.loadFile('index.html');
        }

        //注册关闭事件
        mainWindow.on('closed', () => {
            mainWindow = null;
        })

        if (process.argv.includes('-t')) {
            mainWindow.webContents.openDevTools() // 调试
        }
    }
}

app.on('ready', function() {
    openWindow();
})

app.on('activate', function() {
    openWindow();
})

app.on('window-all-closed', () => {
    app.quit()
})

// 关闭所有窗口后退出程序
// app.on('window-all-closed', () => {
//     app.quit()
// })