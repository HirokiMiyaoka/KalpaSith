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
declare class AppHistory extends EventTarget {
    private renderer;
    private spa;
    constructor(renderer: Renderer);
    private onPopState;
    gotoPage(url: string): Promise<any>;
    convertAnchor(element?: HTMLElement): void;
    jumpPage(url: string): (event: MouseEvent) => boolean;
}
declare class WebComponentsManager {
    private static TAGS;
    static Exclude(...tags: string[]): void;
    private base;
    private tags;
    constructor(base?: string);
    private log;
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
interface CommonMarkElement extends HTMLElement {
    src: string;
}
interface NowLoadingElement extends HTMLElement {
    loading: boolean;
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
    static Init(tagname?: string): Promise<void>;
    constructor();
    loadComponents(...tags: string[]): Promise<void>;
    addModule(mod: KalpaSithModule, update?: boolean): boolean;
    removeModule(mod: KalpaSithModule): KalpaSithModule | null;
    loading(on: boolean): void;
    clear(): void;
    gotoPage(url: string): Promise<any>;
    jumpPage(url: string): (event: MouseEvent) => boolean;
    render(url: string): Promise<any>;
    private afterRender;
    update(): void;
    private parseUrlPath;
    private scrollReset;
}
declare class ServiceWorkerClient {
    static Remove(): Promise<void>;
    initServiceWorker(script?: string): Promise<ServiceWorkerRegistration>;
    resetCache(): Promise<SW_MESSAGE_CACHE>;
    sendMessage(message: SW_MESSAGE): Promise<SW_MESSAGE>;
}
declare function BrowserCheck(): boolean;
