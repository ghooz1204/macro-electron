const robotjs = require('robotjs');

/*
    마우스 강제 입력
*/

module.exports = {
    combineMouse: function (value, mouse, key, modifier)
    {
        /* Dial */
        // 키보드와 마우스 조합
        console.log('combine Mouse');
        console.log('value: ', value, ' mouse: ', mouse, ' key: ', key, ' modifier: ', modifier);
        robotjs.keyToggle(key, 'down', modifier);
        mouse(value);
        robotjs.keyToggle(key, 'up', modifier);
    },
    scrollX: function (value)
    {
        /* Dial */
        // 마우스 가로 스크롤
        console.log('mouse H wheel ', value);
        robotjs.scrollMouse(value * 120, 0);
    },
    scrollY: function (value)
    {
        /* Dial */
        // 마우스 세로 스크롤
        console.log('mouse V wheel ', value);
        robotjs.scrollMouse(0, value * 120);
    },
    oneLeftClick: function ()
    {
        /* Button */
        // 마우스 왼쪽 클릭
        console.log('mouse one left click');
        robotjs.mouseClick('left', false);
    },
    oneRightClick: function ()
    {
        /* Button */
        // 마우스 오른쪽 클릭
        console.log('mouse one right click');
        robotjs.mouseClick('right', false);
    },
    doubleLeftClick: function ()
    {
        /* Button */
        // 마우스 왼쪽 더블 클릭
        console.log('mouse double left click');
        robotjs.mouseClick('left', true);
    },
    doubleRightClick: function ()
    {
        /* Button */
        // 마우스 오른쪽 더블 클릭
        console.log('mouse double right click');
        robotjs.mouseClick('right', true);
    }
}