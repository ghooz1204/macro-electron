const { ipcMain } = require('electron')
const STSObject = require('../send-to-signal')

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // "ping" 출력
  event.reply('asynchronous-reply', 'pong')
})
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // "ping" 출력
  event.returnValue = 'pong'
})

ipcMain.on('dial-click', (event, arg) => {
  // STSObject.sendToDialPush[arg['index'][1]]();
})
ipcMain.on('dial-rotate', (event, arg) => {
  STSObject.sendToDialRotate[arg['index'][1]](arg['value']);
})
ipcMain.on('button-click', (event, arg) => {
  STSObject.sendToButtonPush[arg['index'][1]]();
})