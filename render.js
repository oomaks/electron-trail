const path = require('path')
const {ipcRenderer} = require('electron')

var msg = document.getElementById('msg');

let btnNotification = document.getElementById('btn_notification');  
btnNotification.addEventListener('click', function(){
    msg.innerHTML = '';
    let notification = new Notification("您有一条新的消息", { 
        dir: "auto",  
        lang: "zh-CN",   
        icon: path.join(__dirname, 'avatar.png'),  
        body: '你好啊！我是蚂蚁，我在测试桌面推送'     
    });
    notification.onclick = () => {
        msg.innerHTML = '通知被点击';
    };
});

ipcRenderer.on('sub-win-reply', function(event, args){
    msg.innerHTML = args[1];
});
let btnWin = document.getElementById('btn_win');  
btnWin.addEventListener('click', function(){
    msg.innerHTML = '';
    ipcRenderer.send('create-sub-win', ['second-main', 400, 300]);
});



