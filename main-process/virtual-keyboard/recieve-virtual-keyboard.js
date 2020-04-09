const { ipcMain } = require('electron')
// Electron Main-process module

const STSObject = require('../send-to-signal.jsx')

/*
    Main Process.
    
    가상 키보드로부터 데이터를 수신받아
    STSObject 실행으로 매핑된 키입력 실행
*/

ipcMain.on('dial-click', (event, arg) => {
    // STSObject.sendToDialPush[arg['index'][1]]();
})
ipcMain.on('dial-rotate', (event, arg) => {
    STSObject.sendToDialRotate[arg['index'][1]](arg['value']);
})
ipcMain.on('button-click', (event, arg) => {
    STSObject.sendToButtonPush[arg['index'][1]]();
})