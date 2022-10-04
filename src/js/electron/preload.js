const {remote,contextBridge,ipcRenderer} =  require('electron');
contextBridge.exposeInMainWorld('ipc', {
    // System
    versions:async()=>await ipcRenderer.invoke('versions'),
    // FileSystem Path
    rootDirName:async()=>await ipcRenderer.invoke('rootDirName'), // main.jsがあるディレクトリパス
    basename:async(path)=>await ipcRenderer.invoke('basename', path),
    dirname:async(path)=>await ipcRenderer.invoke('dirname', path),
    extname:async(path)=>await ipcRenderer.invoke('extname', path),
    pathSep:async()=>await ipcRenderer.invoke('pathSep'),
    // FileSystem
    exists:async(path)=>await ipcRenderer.invoke('exists', path),
    isFile:async(path)=>await ipcRenderer.invoke('isFile', path),
    isDir:async(path)=>await ipcRenderer.invoke('isDir', path),
    isLink:async(path)=>await ipcRenderer.invoke('isLink', path),
    isBlockDev:async(path)=>await ipcRenderer.invoke('isBlockDev', path),
    isCharDev:async(path)=>await ipcRenderer.invoke('isCharDev', path),
    isFifo:async(path)=>await ipcRenderer.invoke('isFifo', path),
    isSocket:async(path)=>await ipcRenderer.invoke('isSocket', path),
    mkdir:async(path)=>await ipcRenderer.invoke('mkdir', path),
    cp:async(src, dst, options)=>await ipcRenderer.invoke('cp', src, dst, options),
    readFile:async(path, kwargs)=>await ipcRenderer.invoke('readFile', path, kwargs),
    readTextFile:async(path, encoding='utf8')=>await ipcRenderer.invoke('readTextFile', path, encoding),
    writeFile:async(path, data)=>await ipcRenderer.invoke('writeFile', path, data),
    shell:async(command)=>await ipcRenderer.invoke('shell', command),
    // Network
    fetch:async(url, options)=>await ipcRenderer.invoke('fetch', url, options),
    // bitcoinjs-lib
    decodeTxHex:async(txHex)=>await ipcRenderer.invoke('decodeTxHex', txHex),
})

