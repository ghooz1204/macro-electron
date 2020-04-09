const { ipcRenderer, remote } = require('electron')
// Electron Renderer-process module

/*
    Renderer Process.

    Overlay 창을 렌더하는 File.
    현재 프로그램과 그룹에 맞는 단축키 리스트를 Overlay에 렌더해줌.
    Preset Load, Change 등의 이벤트가 발생했을 때 내용 변경.
*/

const DialContent = document.querySelector('.overlay-dial-content') // Overlay의 Dial부분 부모 div
const ButtonContent = document.querySelector('.overlay-button-content') // Overlay의 Button부분 부모 div

const DialFname = DialContent.querySelectorAll('.overlay-dial-fname') // Overlay에서 각각 Dial의 font 태그
const ButtonFname = ButtonContent.querySelectorAll('.overlay-button-fname') // Overlay에서 각각 Button의 font 태그
const ButtonGroup = ButtonContent.querySelector('.overlay-group') // Overlay에서 Group Button의 font 태그
// 상수 정의

let current_program = remote.getGlobal('currentProgram') // 현재 보여질 프로그램
let current_group = remote.getGlobal('currentGroup') // 현재 그룹 번호
let presets, viewPreset, viewPresetGroup
// Load된 preset 전체 리스트와 현재 프로그램의 preset, 현재 그룹의 preset을 저장
// 변수 정의

function overlayRender()
{
    /*
        Presets Data와 현재 프로그램, 그룹 번호를 통해
        Overlay 창에 그에 맞는 기능 이름을 넣어줌.

        매개변수 :
        반환값 :
    */
    DialFname.forEach((value, index) => {
        // 각각 다이얼에 프리셋 순서대로 기능 이름 렌더
        value.innerHTML = viewPresetGroup.drotate[index].fname
    })

    ButtonFname.forEach((value, index) => {
        // 각각 버튼에 프리셋 순서대로 기능 이름 렌더
        value.innerHTML = viewPresetGroup.bpush[index].fname
    })
    ButtonGroup.innerHTML = `그룹 ${current_group + 1}` // 그룹 번호 렌더
}

ipcRenderer.on('load-presets', function (event, load_presets)
{
    /*
        프로그램이 실행되고 Preset이 모두 Load 되었을 때,
        Overlay에 설정된 값들을 넣어줌.

        매개변수 : presets = Load된 모든 presets
        반환값 :
    */
    presets = JSON.parse(load_presets) // webContents로 부터 넘어온 JSON 파일 Parsing
    viewPreset = presets[current_program] // 그 중 현재 Program만 보여줌
    viewPresetGroup = viewPreset[current_group] // 그 중 현재 Group만 보여줌
    overlayRender() // 재 렌더
})
ipcRenderer.on('change-preset-function', function (event, change_func)
{
    /*
        프로그램 실행 도중 Preset중 function의 Change가 발생했을 때,
        Overlay에 설정된 값들을 새로 렌더링.

        매개변수 : change_func = {
            program: 바뀐 프리셋의 프로그램
            group: 바뀐 프리셋의 그룹
            ktype: 바뀐 프리셋의 키 타입(drotate, bpush)
            ftype: 바뀐 프리셋의 강제입력/Protocol 여부
            index: 바뀐 프리셋의 키 인덱스(0~3)
            fname: 바뀐 프리셋의 키세팅 명
            fcode: 바뀐 프리셋의 키코드 명
        }
        반환값 :
    */
   
    presets[change_func.program][change_func.group][change_func.ktype][change_func.index] = {
        // Preset 특정 기능의 내용을 변경
        fname: change_func.fname,
        fcode: change_func.fcode,
        execute: ""
    }
    overlayRender() // 재 렌더
})

ipcRenderer.on('change-group', function (event, change_group) {
    /*
        프로그램 실행 도중 group의 Change가 발생했을 때,
        Overlay에 설정된 값들을 새로 렌더링.

        매개변수 : change_group = 바뀐 group 번호
        반환값 :
    */
    current_group = change_group // 현재 그룹 번호
    viewPresetGroup = viewPreset[current_group] // 그룹 번호를 바꿔줌
    overlayRender() // 재 렌더
})