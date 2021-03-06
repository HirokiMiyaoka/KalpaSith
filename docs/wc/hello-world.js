(class TestComponent extends HTMLElement {
    static Init(tagname = 'hello-world') { if (customElements.get(tagname)) {
        return;
    } customElements.define(tagname, this); }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.innerHTML = [
            ':host { display: inline-block; }',
        ].join('');
        shadow.appendChild(style);
        shadow.appendChild(document.createTextNode('Hello, '));
        shadow.appendChild(document.createElement('slot'));
    }
}).Init();
