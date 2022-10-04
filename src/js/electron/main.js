const { app, BrowserWindow, session, ipcMain, dialog, net } = require('electron')
const path = require('path')
const fs = require('fs')
const util = require('util')
const childProcess = require('child_process');
const fetch = require('electron-fetch').default; // Node.js v18 ならGlobalにfetchがあるらしいが使えなかったので継続利用する
const bitcoin = require('bitcoinjs-lib')

function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        //transparent: true, // 透過
        //opacity: 0.3,
        //frame: false,      // フレームを非表示にする
        webPreferences: {
            nodeIntegration: false,
            //nodeIntegration: true, // https://www.electronjs.org/ja/docs/latest/breaking-changes
            enableRemoteModule: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('src/index.html')
    //mainWindow.setMenuBarVisibility(false);
    mainWindow.webContents.openDevTools()
}
app.whenReady().then(async()=>{
    createWindow()
    app.on('activate', async()=>{
        if (BrowserWindow.getAllWindows().length === 0) { createWindow() }
    })
})

app.on('window-all-closed', async()=>{
    if (process.platform !== 'darwin') { app.quit() }
})

ipcMain.handle('versions', (event)=>{ return process.versions })
ipcMain.handle('rootDirName', (event)=>{ return __dirname })

ipcMain.handle('basename', (event, p)=>{ return path.basename(p) })
ipcMain.handle('dirname', (event, p)=>{ return path.dirname(p) })
ipcMain.handle('extname', (event, p)=>{ return path.extname(p) })
ipcMain.handle('pathSep', (event, p)=>{ return path.sep })

ipcMain.handle('exists', (event, path)=>{ return fs.existsSync(path) })
ipcMain.handle('isFile', (event, path)=>{ return fs.lstatSync(path).isFile() })
ipcMain.handle('isDir', (event, path)=>{ return fs.lstatSync(path).isDirectory() })
ipcMain.handle('isLink', (event, path)=>{ return fs.lstatSync(path).isSymbolicLink() })
ipcMain.handle('isBlockDev', (event, path)=>{ return fs.lstatSync(path).isBlockDevice() })
ipcMain.handle('isCharDev', (event, path)=>{ return fs.lstatSync(path).isCharacterDevice() })
ipcMain.handle('isFifo', (event, path)=>{ return fs.lstatSync(path).isFIFO() })
ipcMain.handle('isSocket', (event, path)=>{ return fs.lstatSync(path).isSocket() })
ipcMain.handle('mkdir', (event, path)=>{
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive:true})
    }
})
ipcMain.handle('cp', async(event, src, dst, options) => { fs.cp(src, dst, options, ()=>{}); })
ipcMain.handle('readFile', (event, path, kwargs)=>{ return readFile(path, kwargs) })
ipcMain.handle('readTextFile', (event, path, encoding='utf8')=>{ return readFile(path, { encoding: encoding }) })
ipcMain.handle('writeFile', (event, path, data)=>{ return fs.writeFileSync(path, data) })
ipcMain.handle('shell', async(event, command) => {
    const exec = util.promisify(childProcess.exec);
    return await exec(command);
})
/* Node.js v18.10 nodeIntegration: true にしたが fetch api が存在しないと怒られる。「fetch is not defined」
ipcMain.handle('fetch', async(event, url, options) => {
    console.log('IPC')
    const res = await fetch(url, options)
    return await res.text()
})
*/

// fetch の Response は関数を含んでいるためIPCでは返せない。そこで関数実行結果を返す
async function returnMimeTypeData(url, options, res) {
    // res.text(), blob(), arrayBuffer(), formData(), redirect(), clone(), error()
    if (!options) { return await res.text() }
    else if ('application/json' === options.headers['Content-Type']) { return await res.json() }
    else if (options.headers['Content-Type'].match(/text\//)) { return await res.text() }
    else if (options.headers['Content-Type'].match(/(image|audio|video|)\//)) { return await res.blob() }
    else { return await res.text() }
}
ipcMain.handle('fetch', async(event, url, options)=>{
    console.log(url, options)
    const res = await fetch(url, options).catch(e=>console.error(e));
    return await returnMimeTypeData(url, options, res)
})
ipcMain.handle('decodeTxHex', async(event, txHex)=>{
    console.log(txHex)
    const tx = bitcoin.Transaction.fromHex(txHex);
    console.log(tx)
    return tx
})

