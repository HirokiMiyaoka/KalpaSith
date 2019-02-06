class NowLoading extends HTMLElement
{
	public static Init( tagname = 'now-loading' ) { if ( customElements.get( tagname ) ) { return; } customElements.define( tagname, this ); }

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba( 0, 0, 0, 0.8 ); overflow: hidden; display: block; }',
			':host( :not( [ loading ] ) ) { display: none; }',
		].join( '' );

		shadow.appendChild( style );
	}

	get loading() { return this.hasAttribute( 'loading' ); }
	set loading( value )
	{
		if ( value )
		{
			this.setAttribute( 'loading', '' );
		} else
		{
			this.removeAttribute( 'loading' );
		}
	}
}
