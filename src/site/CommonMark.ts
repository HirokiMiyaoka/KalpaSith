declare class CMParser { parse(input: string): Node; }
declare class CMHtmlRenderer { render(root: Node): string; }
declare const commonmark:
{
	Parser: { new(): CMParser },
	HtmlRenderer: { new(): CMHtmlRenderer },
}

class CommonMark extends HTMLElement
{
	public static Init( tagname = 'common-mark' ) { if ( customElements.get( tagname ) ) { return; } customElements.define( tagname, this ); }

	public static cmarked( md: string )
	{
		const reader = new commonmark.Parser();
		const writer = new commonmark.HtmlRenderer();
		const parsed = reader.parse( md );
		return writer.render( parsed );
	}

	public static render( md: string, target: HTMLElement ) { target.innerHTML = this.cmarked( md ); }

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: block; width: 100%; height: fit-content; }',
		].join( '' );

		const slot = document.createElement( 'slot' );
		const observer = new MutationObserver( (mutations) =>
		{
			mutations.forEach( ( mutation ) =>
			{
				switch ( mutation.type )
				{
					case 'childList': return this.onUpdateChildList( mutation );
				}
			} );
		} );
		observer.observe( this, { childList: true });

		shadow.appendChild( style );
		shadow.appendChild( document.createElement( 'slot' ) );

		this.onUpdateSource();
	}

	private onUpdateChildList( mutation: MutationRecord )
	{
		if ( mutation.addedNodes.length !== 1 || mutation.addedNodes[ 0 ].nodeName !== '#text' ) { return; }
		this.onUpdateSource();
	}

	private onUpdateSource()
	{
		this.innerHTML = CommonMark.cmarked( this.textContent || '' );
		this.dispatchEvent( new Event( 'change' ) );
	}

	private onUpdateSrc( value: string )
	{
		if ( !value ) { return; }
		App.fetchText( value ).then( ( md ) =>
		{
			this.textContent = md;
			this.dispatchEvent( new Event( 'load' ) );
		} ).catch( ( error ) =>
		{
			this.dispatchEvent( new Event( 'error' ) );
		} );
	}

	get src() { return this.getAttribute( 'src' ) || ''; }
	set src( value ) { this.setAttribute( 'src', value || '' ); }

	static get observedAttributes() { return [ 'src' ]; }

	public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
	{
		if ( oldVal === newVal ) { return; }

		switch ( attrName )
		{
			case 'src': this.onUpdateSrc( newVal ); break;
		}
	}
}
