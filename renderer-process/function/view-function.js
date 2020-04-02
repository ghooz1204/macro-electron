const { ipcRenderer, remote } = require('electron')

const group_num = 4 // 그룹의 최대 개수
let viewCurrentProgram = remote.getGlobal('currentProgram') // 현재 보여질 프로그램
let viewCurrentGroup = 0 // 현재 그룹 번호

function parseViewContent (data, type) {
    // 저장된 데이터를 렌더하기 위해 HTML 테이블 문자열로 변경
    let s = ""
    data.forEach((r, index) => {
        s += `<td class="view-function-element" data-id="${index}" data-group="" data-type="${type}">${r.fname}</td>`
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
        ViewFunctionGroupTitle.innerHTML = element._comment
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
        
        ViewFunctionElements = ViewFunctionGroupMap.querySelectorAll('.view-function-element')
        ViewFunctionElements.forEach((felement, i) => {
            felement.addEventListener('click', function (e) {
                console.log(viewCurrentProgram, index, e.target)
                openSetFunctionWindow(viewCurrentProgram, index, e.target.dataset.type)
            })
        })
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

})


function setFunctionPreset(program, group, type, fname, fc)
{
    console.log(program, group, type, fname, fc)
    if (fname != "" && fc != "")
    {

        ipcRenderer.send('preset-change', {fname: fname, fc: fc})
    }
    else
    {
        alert('단축키를 입력해주세요.')
    }
}

function openSetFunctionWindow(program, group, type)
{
    document.querySelector('.shade').classList.toggle('on') // shade를 켜줌
    document.querySelector('.set-function').classList.toggle('on') // set-function을 켜줌

    let SetFunctionContent = document.querySelector('.set-function-content')
    let SetFunctionForm = document.createElement('div')
    SetFunctionForm.className = "set-function-form"

    let SetFunctionInputFName = document.createElement('input')
    SetFunctionInputFName.className = "set-function-input"
    SetFunctionInputFName.type = "text"
    SetFunctionInputFName.placeholder = "기능 명을 입력하세요."

    let SetFunctionInputFCode = document.createElement('input')
    SetFunctionInputFCode.className = "set-function-input"
    SetFunctionInputFCode.type = "text"
    SetFunctionInputFCode.placeholder = "단축키를 직접 눌러 입력하세요."
    SetFunctionInputFCode.dataset.isPush = ""
    SetFunctionInputFCode.addEventListener('keydown', function (ev) {
        if (!ev.repeat)
        {
            console.log(ev)
            ev.target.value = ""
            let isPush = []
            if (ev.target.dataset.isPush != "") { isPush = ev.target.dataset.isPush.split(',') }
            
            if (isPush.indexOf(ev.key) == -1) {
                if (isPush.length == 0) { ev.target.placeholder = ev.key }
                else { ev.target.placeholder += ` + ${ev.key}`}
                
                isPush.push(ev.key)
            }
            ev.target.dataset.isPush = isPush.toString()
        }
        ev.preventDefault()
    })
    SetFunctionInputFCode.addEventListener('keyup', function (ev) {
        console.log(ev)
        let isPush = ev.target.dataset.isPush.split(',')
        let index = isPush.indexOf(ev.key)
        isPush.splice(index, 1)

        if (isPush.length == 0) {
            ev.target.value = ev.target.placeholder
            ev.target.placeholder == ""
        }

        ev.target.dataset.isPush = isPush.toString()
        ev.preventDefault()
    })
    SetFunctionInputFCode.addEventListener('mousewheel', function (e) {
        console.log(e)

        e.preventDefault()
    })

    let SetFunctionRegister = document.createElement('button')
    SetFunctionRegister.className = "set-function-button"
    SetFunctionRegister.innerHTML = "등록"
    SetFunctionRegister.addEventListener('click', function (e) {
        setFunctionPreset(program, group, type, SetFunctionInputFName.value, SetFunctionInputFCode.value)
    })

    let SetFunctionClose = document.createElement('button')
    SetFunctionClose.className = "set-function-button"
    SetFunctionClose.innerHTML = "닫기"
    SetFunctionClose.addEventListener('click', closeSetFunctionWindow)

    SetFunctionForm.appendChild(SetFunctionInputFName)
    SetFunctionForm.appendChild(SetFunctionInputFCode)
    SetFunctionForm.appendChild(SetFunctionRegister)
    SetFunctionForm.appendChild(SetFunctionClose)
    SetFunctionContent.appendChild(SetFunctionForm)
}

function closeSetFunctionWindow(e)
{
    document.querySelector('.set-function-form').remove() // 생성했던 set-function-form을 지움
    document.querySelector('.shade').classList.toggle('on') // shade를 꺼줌
    document.querySelector('.set-function').classList.toggle('on') // set-function을 꺼줌
}