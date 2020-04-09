const { ipcRenderer, remote } = require('electron')
// Electron Renderer-process module

/*
    Renderer Process.

    Renderer Process에서 단축키 셋팅을 위한 함수들을
    정의하고, 설정하는 파일.

    설정된 단축키를 보여주는 렌더 역할과
    단축키의 새로운 설정을 위해 Main Process와 통신하는 역할.
*/

const group_num = 4 // 그룹의 최대 개수
// 상수 정의

let viewCurrentProgram = remote.getGlobal('currentProgram') // 현재 보여질 프로그램
let viewCurrentGroup = 0 // 현재 그룹 번호
// 변수 정의

function parseViewContent (data, type)
{
    // 저장된 데이터를 렌더하기 위해 HTML 테이블 문자열로 변경
    let s = ""
    data.forEach((r, index) => {
        let fcode
        if (type == "drotate") {
            fcode = `
                <div>
                    <div>L: ${r.fcode.left}</div>
                    <div>R: ${r.fcode.right}</div>
                </div>
            `
        } else {
            fcode = `
                <div>
                    <div>${r.fcode}</div>
                </div>
            `
        }
        s += `
        <td class="view-function-element" data-id="${index}" data-type="${type}">
            <div>fname: ${r.fname}</div>
            ${fcode}
        </td>`
    })
    return s
}

ipcRenderer.on('load-presets', function (event, load_presets)
{
    /*
        프로그램이 실행되고 Preset이 모두 Load 되었을 때,
        BrowserView의 Function Viewer에 
        설정된 값들을 보여줌.
    */
    let presets = JSON.parse(load_presets) // webContents로 부터 넘어온 JSON 파일 Parsing
    let viewPreset = presets[viewCurrentProgram] // 그 중 현재 Program만 보여줌
    let ViewFunctionContent = document.querySelector('.view-function-content')
    viewPreset.forEach((element, index) => {
        let ViewFunctionGroup = document.createElement('div') // 그룹 전체를 감싸는 div
        ViewFunctionGroup.className = "view-function-group"
        ViewFunctionGroup.id = `group${index}`
        
            let ViewFunctionGroupTitle = document.createElement('div') // 그룹의 이름을 담는 div
            ViewFunctionGroupTitle.innerHTML = element._comment // 그룹의 이름을 보여줌
            
            let ViewFunctionGroupMap = document.createElement('div')
            ViewFunctionGroupMap.className = "view-function-group-map"
            ViewFunctionGroupMap.innerHTML = `
            <table class="view-function-group-table">
                <thead>
                    <tr>
                        <td width="10%">Type</td>
                        <td width="22.5%">1</td>
                        <td width="22.5%">2</td>
                        <td width="22.5%">3</td>
                        <td width="22.5%">4</td>
                    </tr>
                </thead>
                <tbody>
                    <tr class="view-function-group-dial">
                        <td>Dial</td>
                        ${parseViewContent(element.drotate, "drotate")}
                    </tr>
                    <tr class="view-function-group-dial">
                        <td>Button</td>
                        ${parseViewContent(element.bpush, "bpush")}
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
                openSetFunctionWindow(viewCurrentProgram, index, e.currentTarget.dataset.type, i % 4)
            })
        })
    })
})
ipcRenderer.on('change-preset-function', function (event, change_func)
{
    /*
        프로그램 실행 도중 Preset중 function의 Change가 발생했을 때,
        BrowserView의 Function Viewer에 
        설정된 값들을 새로 렌더링.
    */
    console.log(change_func)
    let ViewGroup = document.querySelector(`#group${change_func.group}`)
    let ViewGroupElements = ViewGroup.querySelectorAll('.view-function-element')
    ViewGroupElements = ViewGroupElements.forEach((value, index) => {
        if (value.dataset.type == change_func.ktype) {
            if (value.dataset.id == change_func.index) {
                let element = value.querySelectorAll('div')
                let fcode
                element[0].innerHTML = `fname: ${change_func.fname}`
                if (change_func.ktype == "drotate") {
                    fcode = `
                        <div>L: ${change_func.fcode.left}</div>
                        <div>R: ${change_func.fcode.right}</div>
                    `
                } else {
                    fcode = `
                        <div>${change_func.fcode}</div>
                    `
                }
                element[1].innerHTML = fcode
            }
        }
    })
})

let SetFunctionForm

function openSetFunctionWindow(program, group, type, index)
{
    /*
        현재 설정할 프로그램과 그룹, 다이얼 or 버튼의
        정보를 통해 그에 맞는 설정 창을 열어줌
    */

    let SetFunction = document.querySelector('.set-function') // Set-Function Background div
    SetFunction.classList.toggle('on') // set-function을 켜줌
    let SetFunctionContent = document.querySelector('.set-function-content') // 설정 창 내용이 담길 div
        /* ----- .set-function-content div 태그 하위 요소 ----- */
        SetFunctionForm = document.createElement('div') // 변경할 내용을 담을 div
        SetFunctionForm.className = "set-function-form"
            /* ----- .set-function-form div 태그 하위 요소 ----- */
            let SetFunctionTitle = document.createElement('div') // 어떤 내용을 설정할 지에 대한 내용이 담길 div
            SetFunctionTitle.className = "set-function-title"
                /* ----- .set-function-title div 태그 하위 요소 ----- */
                let SetFunctionProgramName = document.createElement('div') // Program 이름이 담길 div
                SetFunctionProgramName.className = "set-function-program-name"
                SetFunctionProgramName.innerHTML = `Program: ${program}`
                
                let SetFunctionGroupName = document.createElement('div') // Group 이름(번호)가 담길 div
                SetFunctionGroupName.className = "set-function-group-name"
                SetFunctionGroupName.innerHTML = `Group: ${group}`
                
                let SetFunctionTypeName = document.createElement('div') // Button, Dial의 정보가 담길 div
                SetFunctionTypeName.className = "set-function-type-name"
                SetFunctionTypeName.innerHTML = `Type: ${index + 1}번 ${type}`
                /* ----- .set-function-title div 태그 하위 요소 ----- */
            SetFunctionTitle.appendChild(SetFunctionProgramName)
            SetFunctionTitle.appendChild(SetFunctionGroupName)
            SetFunctionTitle.appendChild(SetFunctionTypeName)
            // 어떤 내용을 설정할 지에 대한 내용이 담길 div에 요소 추가

            let SetFunctionInputFName = document.createElement('input') // 변경할 단축키의 기본 / 사용자 설정 이름
            SetFunctionInputFName.className = "set-function-input"
            SetFunctionInputFName.type = "text"
            SetFunctionInputFName.placeholder = "기능 명을 입력하세요."

            let SetFunctionInputFCode = document.createElement('input') // 변경할 단축키의 키 설정 상태
            SetFunctionInputFCode.className = "set-function-input"
            SetFunctionInputFCode.type = "text"
            SetFunctionInputFCode.placeholder = "단축키를 직접 눌러 입력하세요."
            SetFunctionInputFCode.dataset.isPush = ""

            let SetFunctionInputFCodeRIGHT = document.createElement('input')
            if (type == 'drotate')
            {
                SetFunctionInputFCodeRIGHT.className = "set-function-input"
                SetFunctionInputFCodeRIGHT.type = "text"
                SetFunctionInputFCodeRIGHT.placeholder = "단축키를 직접 눌러 입력하세요."
                SetFunctionInputFCodeRIGHT.dataset.isPush = ""
            }

            let SetFunctionInputFType = document.createElement('input') // 변경할 단축키의 단축키 / Protocol 여부
            SetFunctionInputFType.type = "hidden"
            SetFunctionInputFType.id = "ftype"
            SetFunctionInputFType.value = "forceKeyboard"
            // SetFunctionInputFType.value = "forceMouse"
            SetFunctionInputFCode.addEventListener('keydown', setFunctionInputFCodeKeydown)
            SetFunctionInputFCode.addEventListener('keyup', setFunctionInputFCodeKeyup)
            SetFunctionInputFCode.addEventListener('mousewheel', setFunctionInputFCodeMousewheel)
            SetFunctionInputFCode.addEventListener('click', setFunctionInputFCodeClick)
            if (type == 'drotate')
            {
                SetFunctionInputFCodeRIGHT.addEventListener('keydown', setFunctionInputFCodeKeydown)
                SetFunctionInputFCodeRIGHT.addEventListener('keyup', setFunctionInputFCodeKeyup)
                SetFunctionInputFCodeRIGHT.addEventListener('mousewheel', setFunctionInputFCodeMousewheel)
                SetFunctionInputFCodeRIGHT.addEventListener('click', setFunctionInputFCodeClick)
            }

            let SetFunctionRegister = document.createElement('button') // 설정된 키를 등록하는 버튼
            SetFunctionRegister.className = "set-function-button"
            SetFunctionRegister.innerHTML = "등록"
            SetFunctionRegister.addEventListener('click', function (e) {
                // 등록버튼을 클릭했을 때 발생할 이벤트.
                if (type == 'drotate') {
                    setPresetFunction(program, group, type, SetFunctionInputFType.value, 
                        index, SetFunctionInputFName.value, {left: SetFunctionInputFCode.value, right: SetFunctionInputFCodeRIGHT.value })
                } else {
                    setPresetFunction(program, group, type, SetFunctionInputFType.value, 
                        index, SetFunctionInputFName.value, SetFunctionInputFCode.value)
                }
            })

            let SetFunctionClose = document.createElement('button') // 설정 창을 닫는 버튼
            SetFunctionClose.className = "set-function-button"
            SetFunctionClose.innerHTML = "닫기"
            SetFunctionClose.addEventListener('click', closeSetFunctionWindow) // 클릭 시 설정 창을 닫는 이벤트 추가
            /* ----- .set-function-form div 태그 하위 요소 ----- */
        SetFunctionForm.appendChild(SetFunctionTitle)
        SetFunctionForm.appendChild(SetFunctionInputFName)
        SetFunctionForm.appendChild(SetFunctionInputFCode)
        if (type=='drotate') SetFunctionForm.appendChild(SetFunctionInputFCodeRIGHT)
        SetFunctionForm.appendChild(SetFunctionInputFType)
        SetFunctionForm.appendChild(SetFunctionRegister)
        SetFunctionForm.appendChild(SetFunctionClose)
        // 변경할 내용을 담을 div에 요소 추가
        /* ----- .set-function-content div 태그 하위 요소 ----- */
    SetFunctionContent.appendChild(SetFunctionForm)
}

function closeSetFunctionWindow(e)
{
    /*
        단축키 설정 창을 닫음
    */
    SetFunctionForm.remove() // 생성했던 set-function-form을 지움
    let SetFunction = document.querySelector('.set-function') // Set-Function Background div
    SetFunction.classList.toggle('on') // set-function을 꺼줌
}


function setPresetFunction(program, group, ktype, ftype, index, fname, fcode)
{
    if (fname != "" && fcode != undefined) {
        ipcRenderer.send('change-preset-function', {
            program: program, // 바꿀 프리셋의 프로그램
            group: group, // 바꿀 프리셋의 그룹
            ktype: ktype, // 바꿀 프리셋의 키 타입(drotate, bpush)
            ftype: ftype, // 바꿀 프리셋의 강제입력/Protocol 여부
            index: index, // 바꿀 프리셋의 키 인덱스(0~3)
            fname: fname, // 바꿀 프리셋의 키세팅 명
            fcode: fcode // 바꿀 프리셋의 키코드 명
        })
        closeSetFunctionWindow()
    } else {
        alert('단축키를 입력해주세요.')
    }
}

function setFunctionInputFCodeKeydown(ev) {
    /* 
        키보드를 눌렀을 때 발생할 이벤트.
        동시 키 입력 인식을 위한 Solution.
        입력된 키를 Array에 push.
    */
    if (!ev.repeat) // 키 이벤트 반복 발생 방지
    {
        let ek = ev.key.replace("Arrow", "") // 화살표의 경우 삭제

        ev.target.value = "" // 새로운 키 입력 시 데이터 값을 초기화
        let isPush = [] // 동시 입력된 키를 저장할 Array
        if (ev.target.dataset.isPush != "") // 최초로 키 입력이 발생했을 경우를 제외하고
        {
            isPush = ev.target.dataset.isPush.split(',') // ,로 분리된 배열을 선택
        }

        if (isPush.indexOf(ek) == -1) {
            // 동시 키 입력 Array에서 같은 키가 없을 경우
            if (isPush.length == 0) { ev.target.placeholder = ek } // 최초 키 입력이 발생하면 키를 그대로 저장
            else { ev.target.placeholder += ` + ${ek}` } // 두번째 부터는 ' + '를 추가하여 저장
            isPush.push(ek) // 동시 입력 키들이 담긴 Array에 입력한 키를 저장.
        }
        ev.target.dataset.isPush = isPush.toString() // 동시 입력된 데이터를 data-is-push에 string으로 변경 후 저장
    }
    ev.preventDefault() // 실제 키보드 입력을 취소함
}

function setFunctionInputFCodeKeyup(ev) {
    /* 
        키보드를 뗐을 때 발생할 이벤트.
        동시 키 입력 인식을 위한 Solution.
        뗀 키를 Array에서 pop.
    */
    let ek = ev.key.replace("Arrow", "") // 화살표의 경우 삭제

    let isPush = ev.target.dataset.isPush.split(',') // string type의 data-is-push를 배열로 바꿔줌
    let index = isPush.indexOf(ek) // 현재 키가 입력된 상태인지 몇 번 index에 저장되어 있는지 확인
    isPush.splice(index, 1) // 입력된 키들이 담긴 Array에서 뗀 키를 제거.

    if (isPush.length == 0) { // 모든 키가 다 떼져 있을 경우
        ev.target.value = ev.target.placeholder // 회색 임시 영역의 데이터를 값으로 변경
        ev.target.placeholder == "" // 임시 영역을 삭제
    }

    ev.target.dataset.isPush = isPush.toString() // 동시 입력된 데이터를 data-is-push에 string으로 변경 후 저장
    ev.preventDefault() // 실제 키보드 입력을 취소함
}

function setFunctionInputFCodeMousewheel(e) {
    /* 
        마우스 휠 조작 시 발생할 이벤트.
        동시 키 입력 인식을 위한 Solution.
    */
    console.log(e)

    e.preventDefault() // 실제 마우스 입력을 취소함
}

function setFunctionInputFCodeClick(e) {
    console.log(e)
    e.preventDefault()
}

function setFunctionInputFCodeDoubleClick(e) {
    console.log(e)
    e.preventDefault()
}

function setFunctionInputFCodeContextMenu(e) {

}