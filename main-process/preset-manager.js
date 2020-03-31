const fs = require('fs')
const glob = require('glob')
const path = require('path')
const { webContents } = require('electron')
const EventEmitter = require('events')

const __DIR_PRESETS = glob.sync(path.join(__dirname, '../preset/**/*.json'))
// Preset 파일들의 경로 저장 변수

function PresetManager()
{
    // PresetManager 객체 선언
    EventEmitter.call(this) // EventEmitter를 상속
    this.presets = {} // Preset들을 저장해둘 변수
    // this.loadPreset() // 실행 시 Preset을 초기화
}
PresetManager.prototype = new EventEmitter() // PresetManager 객체 선언

PresetManager.prototype.getPresets = function () { return this.presets } // Get Preset Function
PresetManager.prototype.loadPresets = function ()
{
    // 실행 시 Preset을 초기화 할 수 있도록 저장된 파일로부터 불러옴
    __DIR_PRESETS.forEach((__DIR_PRESET) => {
        let JSONData = JSON.parse(fs.readFileSync(__DIR_PRESET))
        this.presets[JSONData.Program] = JSONData.Preset
    })
    // 동기식으로 실행시킨 후 이벤트 호출
    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('preset-load', JSON.stringify(this.presets))
    })
    this.emit('load')
}

PresetManager.prototype.changePresets = function (newPresets)
{
    // 모든 프리셋을 한 번에 바꿔줌
    this.presets = newPresets
    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('preset-change', JSON.stringify(this.presets))
    })
    this.emit('change')
}

PresetManager.prototype.changePreset = function (pname, newPreset)
{
    // 프리셋 중 하나만 바꿔줌
    this.presets[pname] = newPreset
    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('preset-change', JSON.stringify(this.presets))
    })
    this.emit('change')
}

global.PM = new PresetManager() // 프리셋 관리자 전역으로 생성
global.currentGroup = 0 // 현재 그룹 번호
global.currentProgram = "Background" // 현재 인식된 프로그램