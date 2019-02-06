interface GetParams { [ key: string ]: any }

interface Renderer
{
	render( url: string ): Promise<any>;
}

class AppHistory
{
	private renderer: Renderer;
	private spa: boolean;

	constructor( renderer: Renderer )
	{
		this.renderer = renderer;
		this.spa = typeof history.pushState === 'function';

		if ( !this.spa ) { return; }

		window.addEventListener( 'popstate', ( event ) => { return this.onPopState( event ); }, false );
	}

	private onPopState( event: PopStateEvent )
	{
		this.renderer.render( location.pathname );
	}

	public gotoPage( url: string )
	{
		history.pushState( null, '', url + '' );
		return this.renderer.render( url + '' );
	}

	public convertAnchor( element = document.body )
	{
		const baseurl = location.protocol + '//' + location.host;
		const anchors = element.getElementsByTagName( 'a' );
		for ( let i= 0 ; i < anchors.length ; ++i )
		{
			if ( !anchors[ i ].href || anchors[ i ].onclick ) { continue; }
			if ( anchors[ i ].target === '_blank' ) { anchors[ i ].rel = 'noopener noreferrer'; continue; }
			if ( anchors[ i ].href.indexOf( baseurl ) !== 0 ) { anchors[ i ].target = '_blink'; continue; }
			if ( !this.spa ) { continue; }

			anchors[ i ].onclick = this.jumpPage( anchors[ i ].href );
		}
	}

	private jumpPage( url: string )
	{
		return ( event: MouseEvent ) =>
		{
			event.preventDefault();
			this.gotoPage( url );
			return false;
		};
	}
}
