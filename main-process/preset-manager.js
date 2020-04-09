const fs = require('fs')
const glob = require('glob')
const path = require('path')
const EventEmitter = require('events')
// Node.js module

const { webContents, ipcMain } = require('electron')
// Electron Main-process module

/*
    Main Process.

    프로그램 내의 모든 Preset을 관리해주는 File, Object로
    Preset 불러오기, 저장 등의 활동을 수행한 후 그 결과를
    각각 Main Process와 Renderer Process에 전달함.
*/

const __DIR_PRESETS = glob.sync(path.join(__dirname, '../preset/used/*.json')) // Preset 파일들의 경로 상수 배열
// 상수 정의

function PresetManager()
{
    // PresetManager 객체 선언
    EventEmitter.call(this) // EventEmitter를 상속
    this.presets = {} // Preset들을 저장해둘 변수
    // this.loadPreset() // 실행 시 Preset을 초기화
}
PresetManager.prototype = new EventEmitter() // EventEmitter 상속

PresetManager.prototype.getPresets = function ()
{
    /*
        Get Presets

        매개변수 :
        반환값 : PM이 가지고 있는 모든 Preset Object
    */
    return this.presets
}
PresetManager.prototype.loadPresets = function ()
{
    /*
        Program 실행 시 Preset을 초기화 할 수 있도록 저장된 Preset Files로부터 Load.
        저장된 파일을 모두 읽었을 경우 모든 Renderer-process에 'load-presets' 라는 메세지를 송신.
        'load-presets' 메세지엔 presets이 첨부됨.
        Main-process 전역 객체인 PM에 'load' 라는 이벤트 발생.
        
        매개변수 :
        반환값 :
    */
    __DIR_PRESETS.forEach((__DIR_PRESET) => {
        let JSONData = JSON.parse(fs.readFileSync(__DIR_PRESET))
        this.presets[JSONData.Program] = JSONData.Preset // 읽어온 파일을 프로그램에 맞게 presets 객체에 저장
    })
    // 동기식으로 파일 읽어옴

    webContents.getAllWebContents().forEach((webContent) => {
        // 모든 Renderer-process에 메세지에 presets 첨부하여 송신
        webContent.send('load-presets', JSON.stringify(this.presets))
    })
    this.emit('load')
}
PresetManager.prototype.changePresets = function (new_presets)
{
    /*
        모든 Preset을 한 번에 Change후 preset폴더에 save함.
        바뀌고 저장된 후, 모든 Renderer-process에 'change-presets' 라는 메세지를 송신.
        'change-presets' 메세지엔 presets이 첨부됨.
        Main-process 전역 객체인 PM에 'change' 라는 이벤트 발생.
        
        매개변수 : new_presets = 바꿀 모든 Preset
        반환값 :
    */
    this.presets = new_presets
    
    webContents.getAllWebContents().forEach((webContent) => {
        // 모든 Renderer-process에 메세지에 presets 첨부하여 송신
        webContent.send('change-presets', JSON.stringify(this.presets))
    })
    this.emit('change')
}
PresetManager.prototype.changePreset = function (program_name, new_preset)
{
    /*
        Preset들 중 하나만 Change후 preset폴더에 save함.
        바뀌고 저장된 후, 모든 Renderer-process에 'change-preset' 라는 메세지를 송신.
        'change-preset' 메세지엔 바뀐 preset이 첨부됨.
        Main-process 전역 객체인 PM에 'change' 라는 이벤트 발생.
        
        매개변수 : program_name = 바꿀 Preset의 Program Name, new_preset = 바꿀 Preset
        반환값 :
    */
    this.presets[program_name] = new_preset
    fs.writeFileSync(program_name + '.json', JSON.stringify(new_preset))
    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('change-preset', JSON.stringify(new_preset))
    })
    this.emit('change')
}

PresetManager.prototype.changePresetFunction = function (change_func)
{
    /*
        Preset 하나 중 특정 기능만 Change후 preset폴더에 save함.
        바뀌고 저장된 후, 모든 Renderer-process에 'change-preset-function' 라는 메세지를 송신.
        'change-preset-function' 메세지엔 바뀐 args가 첨부됨.
        
        매개변수 : change_func = {
            program: 바꿀 프리셋의 프로그램
            group: 바꿀 프리셋의 그룹
            ktype: 바꿀 프리셋의 키 타입(drotate, bpush)
            ftype: 바꿀 프리셋의 강제입력/Protocol 여부
            index: 바꿀 프리셋의 키 인덱스(0~3)
            fname: 바꿀 프리셋의 키세팅 명
            fcode: 바꿀 프리셋의 키코드 명
        }
        반환값 :
    */
    let newPreset = this.presets[change_func.program] // 현재 특정 프로그램의 프리셋을 가져옴
    newPreset[change_func.group][change_func.ktype][change_func.index] = {
        // 프리셋의 Group, rotate / push, Index의 정보를 통해 접근하여 새로운 정보 입력
        fname: change_func.fname,
        fcode: change_func.fcode,
        execute: transformKeyCodeToJavaScriptCode(change_func.ktype, change_func.ftype, change_func.fcode) // 일반 fcode를 실행 가능한 JavaScriptCode로 변경
    }

    webContents.getAllWebContents().forEach((webContent) => {
        webContent.send('change-preset-function', change_func)
    })
    fs.writeFileSync(
        path.join(__dirname, `../preset/used/${change_func.program}.json`),
            JSON.stringify({
                Program: change_func.program,
                Preset: newPreset
            })
    )
    this.presets[change_func.program] = newPreset
}

global.PM = new PresetManager() // 프리셋 관리자 전역으로 생성



/* Renderer-process로 부터 메세지를 수신함. */
ipcMain.on('change-preset-function', function (event, change_func)
{
    /*
        프리셋 하나 중 특정 기능만 바꾸는 Renderer-process의 요청이 들어오면
        각각의 데이터와 현재 키 타입을 나타내는 ktype, 강제입력 / Protocol 여부를 나타내는 ftype를 통해
        fcode를 execute 할 수 있는 JavaScript Code로 변경하여 저장.
        
        매개변수 : change_func = {
            program: 바꿀 프리셋의 프로그램
            group: 바꿀 프리셋의 그룹
            ktype: 바꿀 프리셋의 키 타입(drotate, bpush)
            ftype: 바꿀 프리셋의 강제입력/Protocol 여부
            index: 바꿀 프리셋의 키 인덱스(0~3)
            fname: 바꿀 프리셋의 키세팅 명
            fcode: 바꿀 프리셋의 키코드 명
        }
        반환값 :
    */
    console.log('RECEIVE change-preset-function')
    global.PM.changePresetFunction(change_func) // 전달 받은 args를 통해 PresetManager에게 변경 요청
})

function transformKeyCodeToJavaScriptCode(ktype, ftype, fcode)
{
    /*
        회전 / 푸쉬, 강제입력 / Protocol 여부를 통해 사람이 읽을 수 있는 fcode를
        STSObject에서 읽을 수 있는 jscode로 변환시키는 함수.
        fcode -> JavaScript Code
    
        매개변수 : ktype = 다이얼 회전 / 버튼 입력 여부, ftype = 강제 입력 / Protocol 여부, fcode = 변환이 필요한 코드
        반환 값 : ktype, ftype, fcode를 통해 변환된 실제 실행 가능한 execute 문자열.
    */
    let jscode = ""
    let cl, cr
    if (ktype == "drotate")
    {
        // 다이얼 Rotate의 명령을 JavaScript Code로 변형시킴
        switch (ftype) {
            case "forceKeyboard":
                cl = fcode['left'].toLowerCase().split(' + ')
                cr = fcode['right'].toLowerCase().split(' + ')
                
                jscode = `${ftype}.customDials(v,()=>{${ftype}.combineKeys(['${cl.join("','")}'], [])},()=>{${ftype}.combineKeys(['${cr.join("','")}'], [])})`
                break;
        
            case "forceMouse":
                cl = fcode['left'].toLowerCase().split(' + ')
                cr = fcode['right'].toLowerCase().split(' + ')

                break;
        }
    }
    else
    {
        // 버튼 Push의 명령을 JavaScript Code로 변형시킴
        switch (ftype) {
            case "forceKeyboard":
                fcode = fcode.toLowerCase().split(' + ')
                
                jscode = `${ftype}.combineKeys(['${fcode.join("','")}'], [])`
                break;
        
            case "forceMouse":
                fcode = fcode.toLowerCase().split(' + ')

                break;
        }
    }

    return jscode;
}