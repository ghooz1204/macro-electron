const robotjs = require('robotjs');

/*
    키보드 강제 입력
*/

module.exports = {
    customDials: function (value, up, down)
    {
        /* Dial */
        // 다이얼에서 강제입력 할 수 있도록 증가, 감소 사용
        if(value >= 0) {
            // for(var i = 0; i > value; i--)
                up();
        } else {
            // for(var i = 0; i < value; i++)
                down();
        }
    },
    combineKeys: function (keys, modifier)
    {
        /* Button */
        // 일반 키 조합 연속 입력
        if (keys.length > 0) {
            console.log(keys[0]);
            robotjs.keyToggle(keys[0], 'down', modifier);
            this.combineKeys(keys.slice(1, keys.length), modifier);
            robotjs.keyToggle(keys[0], 'up', modifier);
        }
    },
    combineKey: function (key, modifier)
    {
        /* Button */
        // 일반 키와 스페셜 키 조합 입력
        console.log(`keyboard combine ${modifier} + ${key}`);
        robotjs.keyTap(key, modifier);
    },
    macroStringKey: function (keys)
    {
        /* Button */
        // 텍스트 자동 입력
        console.log('keyboard macro');
        robotjs.typeString(keys);
    },
    arrowX: function (value)
    {
        /* Dial */
        // 화살표 가로
        console.log('keyboard H Arrow ', value);
        if(value < 0) {
            for(var i = 0; i > value; i--)
                robotjs.keyTap('left');
        } else {
            for(var i = 0; i < value; i++)
                robotjs.keyTap('right');
        }
    },
    arrowY: function (value)
    {
        /* Dial */
        // 화살표 세로
        console.log('keyboard V Arrow ', value);
        if(value < 0) {
            for(var i = 0; i > value; i--)
                robotjs.keyTap('up');
        } else {
            for(var i = 0; i < value; i++)
                robotjs.keyTap('down');
        } 
    },
    squareBrackets: function (value)
    {
        /* Dial */
        // 대괄호
        console.log('square brackets ', value);
        if(value >= 0) {
            // for(var i = 0; i > value; i--)
                robotjs.keyTap('[');
        } else {
            // for(var i = 0; i < value; i++)
                robotjs.keyTap(']');
        }
    }
}