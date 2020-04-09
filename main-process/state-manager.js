const EventEmitter = require('events')
// Node.js module

const { webContents, ipcMain } = require('electron')
// Electron Main-process module

/*
    Main Process.
    
    프로그램 내의 모든 State을 관리해주는 File, Object로
    현재 그룹 번호, 현재 프로그램, 현재 프리셋 등의 활동을 수행한 후
    그 결과를 각각 Main Process와 Renderer Process에 전달함.
*/
const GROUP_NUM = 4 // 총 그룹 갯수
// 상수 정의

global.currentGroup = 0 // 현재 그룹 번호
global.groupChange = function () {
    global.currentGroup = (global.currentGroup + 1) % GROUP_NUM
    global.overlay.show() // 오버레이를 켬
    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('change-group', global.currentGroup)
    })
}
global.currentProgram = "Background" // 현재 인식된 프로그램


function StateManager()
{
    // StateManager 객체 선언
    EventEmitter.call(this) // EventEmitter를 상속
    this.current_group = 0
    this.current_program = "Background"
}
StateManager.prototype = new EventEmitter() // EventEmitter 상속

StateManager.prototype.getCurrentGroup = function ()
{
    return this.current_group
}
StateManager.prototype.setCurrentGroup = function (index)
{
    this.current_group = index % GROUP_NUM
}

StateManager.prototype.getCurrentProgram = function ()
{
    return this.current_program
}
StateManager.prototype.setCurrentProgram = function (program)
{
    this.current_program = program
}

StateManager.prototype.changeGroup = function ()
{
    this.current_group = (this.current_group + 1) % GROUP_NUM
    global.overlay.show() // 오버레이를 켬
    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('change-group')
    })
}

global.SM = new StateManager() // 상태 관리자 전역으로 생성