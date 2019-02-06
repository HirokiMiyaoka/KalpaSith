class ScrollBox extends HTMLElement
{
	public static Init( tagname = 'scroll-box' ) { if ( customElements.get( tagname ) ) { return; } customElements.define( tagname, this ); }

	constructor()
	{
		super();

		const shadow = this.attachShadow( { mode: 'open' } );

		const style = document.createElement( 'style' );
		style.innerHTML = [
			':host { display: block; width: 100%; height: fit-content; --back-color: var( --back, rgba( 0, 0, 0, 0.8 ) ); --front-color: var( --front, #eee ); overflow: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }',
			':host::-webkit-scrollbar { overflow: hidden; width: 5px; height: 5px; background: var( --back-color ); border-radius: 3px; }',
			':host::-webkit-scrollbar-button { display: none; }',
			':host::-webkit-scrollbar-piece { background: var( --back-color ); }',
			':host::-webkit-scrollbar-piece:start { background: var( --back-color ); }',
			':host::-webkit-scrollbar-thumb { overflow: hidden; border-radius: 3px; background: var( --front-color ); }',
			':host::-webkit-scrollbar-corner { overflow: hidden; border-radius: 3px; background: var( --front-color ); }',
		].join( '' );

		shadow.appendChild( style );
		shadow.appendChild( document.createElement( 'slot' ) );
	}
}
