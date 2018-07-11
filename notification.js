/* const { ipcRenderer } = require('electron');

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
module.exports = notifier; */

const uuidv4 = require('uuid/v4');

const KunLunNotification = function(){};
KunLunNotification.callbacks = {};

KunLunNotification.getInstance = function(){
    try {
        if (process.type === 'renderer') {
            return new RendererNotification();
        } else if (process.type === 'browser') {
            return new BrowserNotification();
        } else {
            return new FakeNotification();
        }
    } catch (err) {
        console.error('log error', err);
    }
};

KunLunNotification.prototype.notify = function(options){
    throw new Error('Not Implemented');
};

KunLunNotification.prototype._param = function(options) {
    this.options = options || {};
    this.options.identity = 'notifier';
    this.options.id = this.options.id || uuidv4();
    this.options.group = this.options.group || uuidv4();
    this.options.title = this.options.title || 'Title';
    this.options.type = this.options.type || 'msg';
    this.options.msg = this.options.msg || 'Msg';
    this.options.icon = this.options.icon || '';
    this.options.click = this.options.click || function(){};
}

const RendererNotification = function(){
    KunLunNotification.apply(this);
    const { ipcRenderer } = require('electron');
    ipcRenderer.removeListener('sub-win-reply', this._listener);
    ipcRenderer.on('sub-win-reply', this._listener);
};
RendererNotification.prototype = new KunLunNotification();

RendererNotification.prototype._listener = function(event, params){
    KunLunNotification.callbacks[params.id]();
};

RendererNotification.prototype.notify = function(options){
    const { ipcRenderer } = require('electron');

    this._param(options);
    KunLunNotification.callbacks[this.options.id] = this.options.click;
    ipcRenderer.send('update-sub-win', this.options);
};

const BrowserNotification = function(){
    KunLunNotification.apply(this);
};
BrowserNotification.prototype = new KunLunNotification();

const FakeNotification = function(){
    KunLunNotification.apply(this);
};
FakeNotification.prototype = new KunLunNotification();

FakeNotification.prototype.notify = function(options){
    this._param(options);
    console.log('notify:', this.options);
};

module.exports = KunLunNotification;