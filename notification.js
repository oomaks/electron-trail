const { ipcRenderer } = require('electron');

let click;
class KunLunNotification {
    notify(options) {
        this._param(options);
        ipcRenderer.send('update-sub-win', this.options);
        ipcRenderer.removeListener('sub-win-reply', this._listener);
        ipcRenderer.on('sub-win-reply', this._listener);
    }

    _param(options) {
        this.options = options || {};
        this.options.identity = 'notifier';
        this.options.id = this.options.id || '123';
        this.options.title = this.options.title || 'Title';
        this.options.msg = this.options.msg || 'Msg';
        this.options.icon = this.options.icon || '';
        click = this.options.click || function(){};
    }

    _listener(event, params){
        click();
    }
}

const notifier = new KunLunNotification();
module.exports = notifier;