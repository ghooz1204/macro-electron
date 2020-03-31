const { ipcRenderer, remote } = require('electron')

const group_num = 4 // 그룹의 최대 개수
let viewCurrentProgram = remote.getGlobal('currentProgran') // 현재 보여질 프로그램
let viewCurrentGroup = 0 // 현재 그룹 번호

function parseViewContent (data, type) {
    // 저장된 데이터를 렌더하기 위해 HTML 테이블 문자열로 변경
    let s = ""
    data.forEach((r, index) => {
        s += `<td class="view-function-element" data-id="${index}" data-type="${type}">${r.fname}</td>`
    })
    return s
}

ipcRenderer.on('preset-load', function (event, args) {
    /*
        프로그램이 실행되고 Preset이 모두 Load 되었을 때,
        BrowserView의 Function Viewer에 
        설정된 값들을 보여줌.
    */
    let presets = JSON.parse(args) // webContents로 부터 넘어온 JSON 파일 Parsing
    let viewPreset = presets[viewCurrentProgram] // 그 중 현재 Program만 보여줌
    let ViewFunctionContent = document.querySelector('.view-function-content')
    viewPreset.forEach((element, index) => {
        let ViewFunctionGroup = document.createElement('div')
        ViewFunctionGroup.className = "view-function-group"
        ViewFunctionGroup.id = `group${index}`
        // 그룹 전체를 감싸는 div 생성

        let ViewFunctionGroupTitle = document.createElement('div')
        ViewFunctionGroupTitle.innerHTML = `Group ${index + 1}`
        // 그룹의 이름 div 생성
        let ViewFunctionGroupMap = document.createElement('div')
        ViewFunctionGroupMap.className = "view-function-group-map"
        ViewFunctionGroupMap.innerHTML = `
        <table class="view-function-group-table">
            <thead>
                <tr>
                    <td width="20%">Type</td>
                    <td width="20%">1</td>
                    <td width="20%">2</td>
                    <td width="20%">3</td>
                    <td width="20%">4</td>
                </tr>
            </thead>
            <tbody>
                <tr class="view-function-group-dial">
                    <td>Dial</td>
                    ${parseViewContent(element.drotate, "dial")}
                </tr>
                <tr class="view-function-group-dial">
                    <td>Button</td>
                    ${parseViewContent(element.bpush, "push")}
                </tr>
            </tbody>
        </table>`
        // 그룹의 내용(설정된 값들을 확인) div 생성
        ViewFunctionGroup.appendChild(ViewFunctionGroupTitle)
        ViewFunctionGroup.appendChild(ViewFunctionGroupMap)
        ViewFunctionContent.appendChild(ViewFunctionGroup)
    })
})
ipcRenderer.on('preset-change', function (event, args) {
    /*
        프로그램 실행 도중 Preset의 Change가 발생했을 때,
        BrowserView의 Function Viewer에 
        설정된 값들을 새로 렌더링.
    */
    let presets = JSON.parse(args)
    let viewPreset = presets[viewCurrentProgram]
    viewPreset.forEach((element, index) => {

    })
})