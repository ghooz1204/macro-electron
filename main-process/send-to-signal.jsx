const forceKeyboard = require('../forced-input/forced-keyboard')
const forceMouse = require('../forced-input/forced-mouse')

/*
    Main Module
    INVAIZ Keyboard의 입력을 받아
    사용자가 지정한 단축키 or CEP Protocol로 변환 후
    실행하는 파일.
*/

function sendCurrentFuntion(type, index, v = 0) {
    // 현재 프로그램의 Preset과 Group에 해당하는 명령 실행.
    // 다이얼의 경우 v라는 값으로 다이얼 회전 값인 value 전달.
    let parseFunction = global.PM.getPresets()
    let f = parseFunction[global.currentProgram][global.currentGroup];
    global.overlay.show() // 오버레이를 켬
    if (f) {
        if (type == "Dial") {
            // 다이얼 실행
            eval(f.drotate[index].execute)
        } else {
            // 버튼 입력 실행
            eval(f.bpush[index].execute)
        }
    }
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
        () => global.groupChange() // 그룹 변경
    ]
}