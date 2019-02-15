/// <reference path="./App.ts" />
/// <reference path="./KalpaSith.ts" />
/// <reference path="./ServiceWorker.ts" />

function BrowserCheck()
{
	// This browser can use fetch
	if ( typeof fetch !== 'function' ) { return false; }

	// This browser can use <temolate>
	if ( !( 'content' in document.createElement( 'template' ) ) ) { return false; }

	// This browser can use CSS Custom properties
	var style = document.createElement('style').style;
	style.setProperty( '--test', '0' );
	if ( style.getPropertyValue( '--test' ) !== '0' ){ return false; }

	// This browser is modern.
	return true;
}

document.addEventListener( 'DOMContentLoaded', () =>
{
	// Legacy Browser.
	if ( !BrowserCheck() ) { return; }

	// Modern browser.
	(<HTMLElement>document.getElementById( 'legacy' )).classList.remove( 'view' );

	customElements.whenDefined( 'now-loading' ).then( () =>
	{
		return customElements.whenDefined( 'kalpa-sith' );
	} );

	// Init default components.
	NowLoading.Init();
	CommonMark.Init();
	ScrollBox.Init();
	KalpaSith.Init();

	( ( qrbutton: HTMLElement ) =>
	{
		qrbutton.addEventListener( 'click', ( link ) =>
		{
			const tid = qrbutton.dataset.target;
			if ( !tid ) { return; }
			const target = document.getElementById( tid );
			if ( !target ) { return; }

			if ( target.classList.contains( 'show' ) )
			{
				target.classList.remove( 'show' );
				return;
			}

			const url = location.href;
			let first = false;
			target.querySelectorAll( 'qr-code' ).forEach( ( qr: HTMLInputElement ) =>
			{
				if ( !qr.value ) { first = true; }
				if ( qr.value === url ) { return; }
				qr.value = url;
			} );

			if ( first ) { target.addEventListener( 'click', () => { target.classList.remove( 'show' ); }, false ); }
			target.classList.add( 'show' );
		}, false );
	} )( <HTMLElement>document.getElementById( 'qrlink' ) );

	if ( App.script.dataset.sw )
	{
		// Set ServiceWorker.
		const sw = new ServiceWorkerClient();
		sw.initServiceWorker( App.script.dataset.sw );
	}
} );
