/// <reference path="./AppHistory.ts" />
/// <reference path="./WebComponentsManager.ts" />
// Default components.
/// <reference path="./CommonMark.ts" />
/// <reference path="./NowLoading.ts" />
/// <reference path="./ScrollBox.ts" />

interface KalpaSithModule extends Renderer, HTMLElement
{
	isSupported( path: string ): boolean;
}

class KalpaSith extends HTMLElement implements Renderer
{
	public static Version = '';
	private basetitle: string;
	private modules: KalpaSithModule[];
	private nowloading: NowLoadingElement;
	private history: AppHistory;
	private components: WebComponentsManager;
	private commonmark: CommonMarkElement;

	public static Init( tagname = 'kalpa-sith' )
	{
		if ( customElements.get( tagname ) ) { return Promise.resolve(); }
		return Promise.all(
		[
			customElements.whenDefined( 'now-loading' ),
			customElements.whenDefined( 'common-mark' ),
		] ).then( () =>
		{
			customElements.define( tagname, this );
			return customElements.whenDefined( tagname );
		} );
	}

	constructor()
	{
		super();
		this.modules = [];
		this.basetitle = document.title;
		KalpaSith.Version = App.script.src.includes( '?' ) ? App.script.src.split( '?' ).pop() || '' : '';
		const root = ( App.script.dataset.root || '' ) + '/';
		this.history = new AppHistory( this );
		this.components = new WebComponentsManager( root + 'wc/' );
		this.components.suffix = KalpaSith.Version;
		this.commonmark = new (customElements.get( 'common-mark' ))();
		this.nowloading = new (customElements.get( 'now-loading' ))();
		document.body.appendChild( this.nowloading );

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: block; width: 100%; height: fit-content; }',
		].join( '' );

		shadow.appendChild( style );
		shadow.appendChild( document.createElement( 'slot' ) );
		this.appendChild( this.commonmark );

		this.history.convertAnchor();
		this.components.searchAndLoadAsync();
		this.commonmark.addEventListener( 'change', () =>
		{
			this.components.searchAndLoadAsync( this.commonmark ).then( () => { this.update(); } );
		} );

		const observer = new MutationObserver( ( mutations ) =>
		{
			if ( mutations.filter( ( mutation ) => { return 0 < mutation.addedNodes.length; } ).length <= 0 ) { return; }
			this.afterRender();
		} );
		observer.observe( this, { childList: true, subtree: true } );

		customElements.whenDefined( 'kalpa-sith' ).then( () =>
		{
			const redirect = <string>sessionStorage.redirect;
			delete sessionStorage.redirect;
			if ( redirect && typeof redirect === 'string' && redirect !== location.href )
			{
				history.replaceState( null, '', redirect );
				return redirect;
			}
			return location.href;
		} ).then( ( url ) => { this.render( url ); } );
	}

	public loadComponents( ... tags: string[] )
	{
		if ( tags.length <= 0 ) { return this.components.searchAndLoadAsync( this ); }

		return this.components.loadAsync( tags );
	}

	public addModule( mod: KalpaSithModule, update = true )
	{
		if ( !mod || !mod.tagName || typeof mod.tagName !== 'string' ||
			typeof mod.isSupported !== 'function' || typeof mod.render !== 'function' ) { return false; }

		for ( let i = this.modules.length - 1 ; 0 <= i ; --i )
		{
			if ( this.modules[ i ].tagName !== mod.tagName ) { continue; }
			this.modules[ i ] === mod;
			return true;
		}
		this.modules.push( mod );

		if ( update ) { this.render( location.href ); }

		return true;
	}

	public removeModule( mod: KalpaSithModule )
	{
		if ( !mod || !mod.tagName || typeof mod.tagName !== 'string' ) { return null; }

		for ( let i = this.modules.length - 1 ; 0 <= i ; --i )
		{
			if ( this.modules[ i ].tagName !== mod.tagName ) { continue; }
			const m = this.modules[ i ];
			this.modules.splice( i, 1 );
			return m;
		}

		return null;
	}

	public loading( on: boolean ) { this.nowloading.loading = on; }

	public clear()
	{
		document.title = this.basetitle;
		App.clear( this );
	}

	public gotoPage( url: string ) { return this.history.gotoPage( url ); }

	public render( url: string ): Promise<any>
	{
		let path = this.parseUrlPath( url );

		this.loading( true );

		for ( let mod of this.modules )
		{
			if ( !mod.isSupported( path ) ) { continue; }
			return mod.render( path ).then( () =>
			{
				App.clear( this );
				this.appendChild( mod );
			} );
		}

		if ( path.match( '/$' ) ) { path += 'index' }
		path += '.md';
		this.commonmark.src = path;
		App.clear( this );
		this.appendChild( this.commonmark );

		return Promise.resolve();
	}

	private afterRender()
	{
		this.loadComponents().then( () =>
		{
			this.update();
			this.loading( false );
		} );
	}

	public update()
	{
		this.history.convertAnchor( this );
	}

	private parseUrlPath( url: string )
	{
		// new URL( url ) cannot parse "/".
		const a = document.createElement( 'a' );
		a.href = url;
		return a.pathname + '';
	}
}
