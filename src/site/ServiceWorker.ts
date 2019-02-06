
class ServiceWorkerClient
{
	public initServiceWorker( script = '/sw.js' )
	{
		if ( !navigator.serviceWorker ) { throw 'ServiceWorker disable.'; }
		navigator.serviceWorker.register( script );
		return navigator.serviceWorker.ready.then( ( registration ) =>
		{
			if ( !registration.active ) { throw 'ServiceWorker not active.'; }
			return registration;
		} );
	}

	public resetCache()
	{
		return this.sendMessage( { type: 'cache' } ).then( ( result ) => { return <SW_MESSAGE_CACHE>result; } );
	}

	public sendMessage( message: SW_MESSAGE )
	{
		return new Promise( ( resolve, reject ) =>
		{
			var sw = navigator.serviceWorker.controller;
			if ( !sw ) { return; }

			var channel = new MessageChannel();
			channel.port1.addEventListener( 'message', ( event ) => { resolve( event ); }, false );
			sw.postMessage( message, [ channel.port2 ] );
		} ).then( ( data ) =>
		{
			// maybe cannot work.
			console.log( 'message:', data );
			return data;
		} );
	}
}
