const App = ((script) => {
    function GetApp() {
        const kalpa = document.querySelector('kalpa-sith');
        if (kalpa) {
            app.main = () => { return kalpa; };
        }
        return kalpa;
    }
    function Wait() { return customElements.whenDefined('kalpa-sith'); }
    function Load(...components) { return app.main().loadComponents(...components); }
    function ClearElements(element) {
        if (!element) {
            return;
        }
        const children = element.children;
        for (let i = children.length - 1; 0 <= i; --i) {
            element.removeChild(children[i]);
        }
    }
    function Fetch(input, init) {
        return fetch(input, init).then((result) => {
            if (result.ok) {
                return result;
            }
            throw result;
        });
    }
    function FetchJson(input, init) {
        return fetch(input, init).then((result) => {
            if (result.ok) {
                return result.json();
            }
            return result.json().then((result) => { throw result; });
        });
    }
    function FetchText(input, init) {
        return fetch(input, init).then((result) => {
            if (result.ok) {
                return result.text();
            }
            return result.text().then((result) => { throw result; });
        });
    }
    const app = {
        script: script,
        main: GetApp,
        wait: Wait,
        load: Load,
        clear: ClearElements,
        fetch: Fetch,
        fetchJson: FetchJson,
        fetchText: FetchText,
    };
    return app;
})(document.currentScript);
class AppHistory {
    constructor(renderer) {
        this.renderer = renderer;
        this.spa = typeof history.pushState === 'function';
        if (!this.spa) {
            return;
        }
        window.addEventListener('popstate', (event) => { return this.onPopState(event); }, false);
    }
    onPopState(event) {
        this.renderer.render(location.pathname);
    }
    gotoPage(url) {
        history.pushState(null, '', url + '');
        return this.renderer.render(url + '');
    }
    convertAnchor(element = document.body) {
        const baseurl = location.protocol + '//' + location.host;
        const anchors = element.getElementsByTagName('a');
        for (let i = 0; i < anchors.length; ++i) {
            if (!anchors[i].href || anchors[i].onclick) {
                continue;
            }
            if (anchors[i].target === '_blank') {
                anchors[i].rel = 'noopener noreferrer';
                continue;
            }
            if (anchors[i].href.indexOf(baseurl) !== 0) {
                anchors[i].target = '_blink';
                continue;
            }
            if (!this.spa) {
                continue;
            }
            anchors[i].onclick = this.jumpPage(anchors[i].href);
        }
    }
    jumpPage(url) {
        return (event) => {
            event.preventDefault();
            this.gotoPage(url);
            return false;
        };
    }
}
class WebComponentsManager {
    constructor(base = '') {
        this._suffix = '';
        this.base = base;
        this.tags = Object.assign({}, WebComponentsManager.TAGS);
        const define = customElements.define;
        customElements.define = (name, constructor, option) => {
            if (!this.tags[name]) {
                this.exclude(name);
            }
            define.call(customElements, name, constructor, option);
        };
    }
    static Exclude(...tags) {
        tags.forEach((tag) => {
            if (!this.TAGS[tag]) {
                this.TAGS[tag] = document.createElement('script');
            }
            if (!this.TAGS[tag].hasAttribute('loaded')) {
                this.TAGS[tag].setAttribute('loaded', '');
            }
        });
    }
    log(...message) { if (location.hostname === 'localhost') {
        console.log(...message);
    } }
    get suffix() { return this._suffix; }
    set suffix(value) { this._suffix = value ? '?' + value : ''; }
    exclude(...tags) {
        tags.forEach((tag) => {
            if (!this.tags[tag]) {
                this.tags[tag] = document.createElement('script');
            }
            if (!this.tags[tag].hasAttribute('loaded')) {
                this.tags[tag].setAttribute('loaded', '');
            }
        });
    }
    isExcluded(tag) {
        if (!this.tags[tag]) {
            return false;
        }
        return this.tags[tag].hasAttribute('loaded') && !this.tags[tag].src;
    }
    isDefined(tag) { return !!customElements.get(tag); }
    isLoad(tag) { return !!this.tags[tag]; }
    isLoaded(tag) { return this.tags[tag] && this.tags[tag].hasAttribute('loaded'); }
    loadScript(tag) {
        tag = this.toLower(tag);
        if (!this.tags[tag]) {
            this.tags[tag] = document.createElement('script');
            if (!customElements.get(tag)) {
                this.log('load:', tag);
                this.tags[tag].type = 'text/javascript';
                this.tags[tag].onloadend = () => { this.tags[tag].setAttribute('loaded', ''); };
                this.tags[tag].src = [this.base, tag, '.js', this.suffix].join('');
                document.head.appendChild(this.tags[tag]);
            }
        }
        return tag;
    }
    load(tag) {
        tag = this.loadScript(tag);
        return customElements.whenDefined(tag).then(() => { this.log('loaded:', tag); });
    }
    async loadAsync(tags) {
        for (let i = 0; i < tags.length; ++i) {
            if (this.isLoad(tags[i])) {
                continue;
            }
            await this.load(tags[i]);
        }
    }
    toLower(str) {
        return str.replace(/[A-Z]/g, (char) => { return String.fromCharCode(char.charCodeAt(0) | 32); });
    }
    elementsList(parent) {
        const data = { elements: [], customs: [] };
        const children = parent.children;
        for (let i = children.length - 1; 0 <= i; --i) {
            if (children[i].tagName.includes('-') && !data.customs.includes(children[i].tagName)) {
                data.customs.push(this.toLower(children[i].tagName));
            }
            if (!children[i].children.length) {
                continue;
            }
            data.elements.push(children[i]);
        }
        return data;
    }
    search(parent = document.body, all = false) {
        const elements = [parent];
        const customs = [];
        while (elements.length) {
            const element = elements.shift();
            const data = this.elementsList(element);
            data.customs.forEach((tag) => {
                if (customs.includes(tag)) {
                    return;
                }
                customs.push(tag);
            });
            elements.push(...data.elements);
        }
        return all ? customs : customs.filter((tag) => { return !this.isLoaded(tag) && !this.tags[tag]; });
    }
    searchAndLoad(parent = document.body) {
        return Promise.all(this.search(parent).map((tag) => { return this.load(tag); }));
    }
    searchAndLoadAsync(parent = document.body) {
        return this.loadAsync(this.search(parent));
    }
}
WebComponentsManager.TAGS = {};
((wc) => {
    wc.Init();
})(class CommonMark extends HTMLElement {
    static Init(tagname = 'common-mark') { if (customElements.get(tagname)) {
        return;
    } customElements.define(tagname, this); }
    static cmarked(md) {
        const reader = new commonmark.Parser();
        const writer = new commonmark.HtmlRenderer();
        const parsed = reader.parse(md);
        return writer.render(parsed);
    }
    static render(md, target) { target.innerHTML = this.cmarked(md); }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: block; width: 100%; height: fit-content; }',
        ].join('');
        const slot = document.createElement('slot');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                switch (mutation.type) {
                    case 'childList': return this.onUpdateChildList(mutation);
                }
            });
        });
        observer.observe(this, { childList: true });
        shadow.appendChild(style);
        shadow.appendChild(document.createElement('slot'));
        this.onUpdateSource();
    }
    onUpdateChildList(mutation) {
        if (mutation.addedNodes.length !== 1 || mutation.addedNodes[0].nodeName !== '#text') {
            return;
        }
        this.onUpdateSource();
    }
    onUpdateSource() {
        this.innerHTML = CommonMark.cmarked(this.textContent || '');
        this.dispatchEvent(new Event('change'));
    }
    onUpdateSrc(value) {
        if (!value) {
            return;
        }
        App.fetchText(value).then((md) => {
            this.textContent = md;
            this.dispatchEvent(new Event('load'));
        }).catch((error) => {
            this.dispatchEvent(new Event('error'));
        });
    }
    get src() { return this.getAttribute('src') || ''; }
    set src(value) { this.setAttribute('src', value || ''); }
    static get observedAttributes() { return ['src']; }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal === newVal) {
            return;
        }
        switch (attrName) {
            case 'src':
                this.onUpdateSrc(newVal);
                break;
        }
    }
});
((wc) => {
    wc.Init();
})(class NowLoading extends HTMLElement {
    static Init(tagname = 'now-loading') { if (customElements.get(tagname)) {
        return;
    } customElements.define(tagname, this); }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba( 0, 0, 0, 0.8 ); overflow: hidden; display: block; }',
            ':host( :not( [ loading ] ) ) { display: none; }',
        ].join('');
        shadow.appendChild(style);
    }
    get loading() { return this.hasAttribute('loading'); }
    set loading(value) {
        if (value) {
            this.setAttribute('loading', '');
        }
        else {
            this.removeAttribute('loading');
        }
    }
});
((wc) => {
    wc.Init();
})(class ScrollBox extends HTMLElement {
    static Init(tagname = 'scroll-box') { if (customElements.get(tagname)) {
        return;
    } customElements.define(tagname, this); }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: block; width: 100%; height: fit-content; --back-color: var( --back, rgba( 0, 0, 0, 0.8 ) ); --front-color: var( --front, #eee ); overflow: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }',
            ':host::-webkit-scrollbar { overflow: hidden; width: 5px; height: 5px; background: var( --back-color ); border-radius: 3px; }',
            ':host::-webkit-scrollbar-button { display: none; }',
            ':host::-webkit-scrollbar-piece { background: var( --back-color ); }',
            ':host::-webkit-scrollbar-piece:start { background: var( --back-color ); }',
            ':host::-webkit-scrollbar-thumb { overflow: hidden; border-radius: 3px; background: var( --front-color ); }',
            ':host::-webkit-scrollbar-corner { overflow: hidden; border-radius: 3px; background: var( --front-color ); }',
        ].join('');
        shadow.appendChild(style);
        shadow.appendChild(document.createElement('slot'));
    }
});
class KalpaSith extends HTMLElement {
    constructor() {
        super();
        this.modules = [];
        this.basetitle = document.title;
        KalpaSith.Version = App.script.src.includes('?') ? App.script.src.split('?').pop() || '' : '';
        const root = (App.script.dataset.root || '') + '/';
        this.history = new AppHistory(this);
        this.components = new WebComponentsManager(root + 'wc/');
        this.components.suffix = KalpaSith.Version;
        this.commonmark = new (customElements.get('common-mark'))();
        this.nowloading = new (customElements.get('now-loading'))();
        document.body.appendChild(this.nowloading);
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: block; width: 100%; height: fit-content; }',
        ].join('');
        shadow.appendChild(style);
        shadow.appendChild(document.createElement('slot'));
        this.appendChild(this.commonmark);
        this.history.convertAnchor();
        this.components.searchAndLoadAsync();
        this.commonmark.addEventListener('change', () => {
            this.components.searchAndLoadAsync(this.commonmark).then(() => { this.update(); });
        });
        const observer = new MutationObserver((mutations) => {
            if (mutations.filter((mutation) => { return 0 < mutation.addedNodes.length; }).length <= 0) {
                return;
            }
            this.afterRender();
        });
        observer.observe(this, { childList: true, subtree: true });
        customElements.whenDefined('kalpa-sith').then(() => {
            const redirect = sessionStorage.redirect;
            delete sessionStorage.redirect;
            if (redirect && typeof redirect === 'string' && redirect !== location.href) {
                history.replaceState(null, '', redirect);
                return redirect;
            }
            return location.href;
        }).then((url) => { this.render(url); });
    }
    static Init(tagname = 'kalpa-sith') {
        if (customElements.get(tagname)) {
            return Promise.resolve();
        }
        return Promise.all([
            customElements.whenDefined('now-loading'),
            customElements.whenDefined('common-mark'),
        ]).then(() => {
            customElements.define(tagname, this);
            return customElements.whenDefined(tagname);
        });
    }
    loadComponents(...tags) {
        if (tags.length <= 0) {
            return this.components.searchAndLoadAsync(this);
        }
        return this.components.loadAsync(tags);
    }
    addModule(mod, update = true) {
        if (!mod || !mod.tagName || typeof mod.tagName !== 'string' ||
            typeof mod.isSupported !== 'function' || typeof mod.render !== 'function') {
            return false;
        }
        for (let i = this.modules.length - 1; 0 <= i; --i) {
            if (this.modules[i].tagName !== mod.tagName) {
                continue;
            }
            this.modules[i] === mod;
            return true;
        }
        this.modules.push(mod);
        if (update) {
            this.render(location.href);
        }
        return true;
    }
    removeModule(mod) {
        if (!mod || !mod.tagName || typeof mod.tagName !== 'string') {
            return null;
        }
        for (let i = this.modules.length - 1; 0 <= i; --i) {
            if (this.modules[i].tagName !== mod.tagName) {
                continue;
            }
            const m = this.modules[i];
            this.modules.splice(i, 1);
            return m;
        }
        return null;
    }
    loading(on) { this.nowloading.loading = on; }
    clear() {
        document.title = this.basetitle;
        App.clear(this);
    }
    gotoPage(url) { return this.history.gotoPage(url); }
    render(url) {
        let path = this.parseUrlPath(url);
        this.loading(true);
        for (let mod of this.modules) {
            if (!mod.isSupported(path)) {
                continue;
            }
            return mod.render(path).then(() => {
                App.clear(this);
                this.appendChild(mod);
            });
        }
        if (path.match('/$')) {
            path += 'index';
        }
        path += '.md';
        this.commonmark.src = path;
        App.clear(this);
        this.appendChild(this.commonmark);
        return Promise.resolve();
    }
    afterRender() {
        this.loadComponents().then(() => {
            this.update();
            this.loading(false);
        });
    }
    update() {
        this.history.convertAnchor(this);
    }
    parseUrlPath(url) {
        const a = document.createElement('a');
        a.href = url;
        return a.pathname + '';
    }
}
KalpaSith.Version = '';
class ServiceWorkerClient {
    initServiceWorker(script = '/sw.js') {
        if (!navigator.serviceWorker) {
            throw 'ServiceWorker disable.';
        }
        navigator.serviceWorker.register(script);
        return navigator.serviceWorker.ready.then((registration) => {
            if (!registration.active) {
                throw 'ServiceWorker not active.';
            }
            return registration;
        });
    }
    resetCache() {
        return this.sendMessage({ type: 'cache' }).then((result) => { return result; });
    }
    sendMessage(message) {
        return new Promise((resolve, reject) => {
            var sw = navigator.serviceWorker.controller;
            if (!sw) {
                return;
            }
            var channel = new MessageChannel();
            channel.port1.addEventListener('message', (event) => { resolve(event); }, false);
            sw.postMessage(message, [channel.port2]);
        }).then((data) => {
            console.log('message:', data);
            return data;
        });
    }
}
function BrowserCheck() {
    if (typeof fetch !== 'function') {
        return false;
    }
    if (!('content' in document.createElement('template'))) {
        return false;
    }
    var style = document.createElement('style').style;
    style.setProperty('--test', '0');
    if (style.getPropertyValue('--test') !== '0') {
        return false;
    }
    return true;
}
document.addEventListener('DOMContentLoaded', () => {
    if (!BrowserCheck()) {
        return;
    }
    document.getElementById('legacy').style.display = 'none';
    WebComponentsManager.Exclude('kalpa-sith', 'now-loading', 'common-mark', 'scroll-box', 'qr-code');
    KalpaSith.Init();
    ((qrbutton) => {
        qrbutton.addEventListener('click', (link) => {
            const tid = qrbutton.dataset.target;
            if (!tid) {
                return;
            }
            const target = document.getElementById(tid);
            if (!target) {
                return;
            }
            if (target.classList.contains('show')) {
                target.classList.remove('show');
                return;
            }
            const url = location.href;
            let first = false;
            target.querySelectorAll('qr-code').forEach((qr) => {
                if (!qr.value) {
                    first = true;
                }
                if (qr.value === url) {
                    return;
                }
                qr.value = url;
            });
            if (first) {
                target.addEventListener('click', () => { target.classList.remove('show'); }, false);
            }
            target.classList.add('show');
        }, false);
    })(document.getElementById('qrlink'));
    if (App.script.dataset.sw) {
        const sw = new ServiceWorkerClient();
        sw.initServiceWorker(App.script.dataset.sw);
    }
});
