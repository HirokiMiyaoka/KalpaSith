declare const App: {
    script: HTMLScriptElement;
    main: () => KalpaSith;
    wait: () => Promise<void>;
    load: (...components: string[]) => Promise<void>;
    clear: (element: HTMLElement) => void;
    fetch: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
    fetchJson: <T>(input: RequestInfo, init?: RequestInit | undefined) => Promise<T>;
    fetchText: (input: RequestInfo, init?: RequestInit | undefined) => Promise<string>;
};
interface GetParams {
    [key: string]: any;
}
interface Renderer {
    render(url: string): Promise<any>;
}
declare class AppHistory {
    private renderer;
    private spa;
    constructor(renderer: Renderer);
    private onPopState;
    gotoPage(url: string): Promise<any>;
    convertAnchor(element?: HTMLElement): void;
    private jumpPage;
}
declare class WebComponentsManager {
    private base;
    private tags;
    constructor(base?: string);
    private _suffix;
    suffix: string;
    exclude(...tags: string[]): void;
    isExcluded(tag: string): boolean;
    isDefined(tag: string): boolean;
    isLoad(tag: string): boolean;
    isLoaded(tag: string): boolean;
    private loadScript;
    load(tag: string): Promise<void>;
    loadAsync(tags: string[]): Promise<void>;
    private toLower;
    private elementsList;
    search(parent?: HTMLElement, all?: boolean): string[];
    searchAndLoad(parent?: HTMLElement): Promise<void[]>;
    searchAndLoadAsync(parent?: HTMLElement): Promise<void>;
}
declare class CMParser {
    parse(input: string): Node;
}
declare class CMHtmlRenderer {
    render(root: Node): string;
}
declare const commonmark: {
    Parser: {
        new (): CMParser;
    };
    HtmlRenderer: {
        new (): CMHtmlRenderer;
    };
};
declare class CommonMark extends HTMLElement {
    static Init(tagname?: string): void;
    static cmarked(md: string): string;
    static render(md: string, target: HTMLElement): void;
    constructor();
    private onUpdateChildList;
    private onUpdateSource;
    private onUpdateSrc;
    src: string;
    static readonly observedAttributes: string[];
    attributeChangedCallback(attrName: string, oldVal: any, newVal: any): void;
}
declare class NowLoading extends HTMLElement {
    static Init(tagname?: string): void;
    constructor();
    loading: boolean;
}
declare class ScrollBox extends HTMLElement {
    static Init(tagname?: string): void;
    constructor();
}
interface KalpaSithModule extends Renderer, HTMLElement {
    isSupported(path: string): boolean;
}
declare class KalpaSith extends HTMLElement implements Renderer {
    static Version: string;
    private basetitle;
    private modules;
    private nowloading;
    private history;
    private components;
    private commonmark;
    static Init(tagname?: string): void;
    constructor();
    loadComponents(...tags: string[]): Promise<void>;
    addModule(mod: KalpaSithModule, update?: boolean): boolean;
    removeModule(mod: KalpaSithModule): KalpaSithModule | null;
    loading(on: boolean): void;
    clear(): void;
    gotoPage(url: string): Promise<any>;
    render(url: string): Promise<any>;
    private afterRender;
    update(): void;
    private parseUrlPath;
}
declare class ServiceWorkerClient {
    initServiceWorker(script?: string): Promise<ServiceWorkerRegistration>;
    resetCache(): Promise<SW_MESSAGE_CACHE>;
    sendMessage(message: SW_MESSAGE): Promise<{}>;
}
declare function BrowserCheck(): boolean;
