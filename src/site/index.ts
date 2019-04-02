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
	(<HTMLElement>document.getElementById( 'legacy' )).style.display = 'none';

	// Init default components.
	WebComponentsManager.Exclude( 'kalpa-sith', 'now-loading', 'common-mark', 'scroll-box', 'qr-code' );
	KalpaSith.Init();

	if ( App.script.dataset.sw )
	{
		// Set ServiceWorker.
		const sw = new ServiceWorkerClient();
		sw.initServiceWorker( App.script.dataset.sw );
	}
} );
