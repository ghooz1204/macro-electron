const forceKeyboard = require('../forced-input/forced-keyboard')
const forceMouse = require('../forced-input/forced-mouse')

/*
    INVAIZ Keyboard의 입력을 받아
    사용자가 지정한 단축키 or CEP Protocol로 변환 후
    실행하는 파일.
*/
const group_num = 4 // 그룹의 갯수

function sendCurrentFuntion(type, index, v = 0) {
    // 현재 프로그램의 Preset과 Group에 해당하는 명령 실행 
    let parseFunction = global.PM.getPresets()
    let f = parseFunction[global.currentProgram][global.currentGroup];
    if(f) {
        if (type == "Dial") { // 다이얼 실행
            eval(f.drotate[index].fc)
        } else { // 버튼 입력 실행
            eval(f.bpush[index].fc)
        }
    }
}

function groupChange() {
    // 그룹 변경 함수
    global.currentGroup = (global.currentGroup + 1) % group_num
    console.log('currentGroup :', global.currentGroup)
}

module.exports = {
    sendToDialRotate : [
        (value) => sendCurrentFuntion("Dial", 0, value), // 1번 다이얼과 값
        (value) => sendCurrentFuntion("Dial", 1, value), // 2번 다이얼과 값
        (value) => sendCurrentFuntion("Dial", 2, value), // 3번 다이얼과 값
        (value) => sendCurrentFuntion("Dial", 3, value) // 4번 다이얼과 값
    ],
    sendToButtonPush : [
        () => sendCurrentFuntion("Button", 0), // 1번 버튼
        () => sendCurrentFuntion("Button", 1), // 2번 버튼
        () => sendCurrentFuntion("Button", 2), // 3번 버튼
        () => sendCurrentFuntion("Button", 3), // 4번 버튼
        () => groupChange() // 그룹 변경
    ]
}