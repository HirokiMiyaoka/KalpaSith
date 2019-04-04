
class ServiceWorkerClient
{
	public static Remove()
	{
		if ( !navigator.serviceWorker ) { return Promise.reject( new Error( 'ServiceWorker disable.' ) ); }
		return navigator.serviceWorker.getRegistrations().then( ( registrations ) =>
		{
			// Remove ServiceWorkers.
			return Promise.all( registrations.map( ( registration ) =>
			{
				return registration.unregister().catch( () => {} );
			} ) );
		} ).then( () =>
		{
			// Remove caches.
			return caches.keys().then( ( keys ) =>
			{
				return Promise.all( keys.map( ( key ) =>
				{
					return caches.delete( key ).catch( () => {} );
				} ) );
			} );
		} ).then( () => {});
	}

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
		return new Promise<MessageEvent>( ( resolve, reject ) =>
		{
			const sw = navigator.serviceWorker.controller;
			if ( !sw ) { return; }

			const channel = new MessageChannel();
			channel.port1.addEventListener( 'message', ( event ) => { resolve( event ); }, false );
			sw.postMessage( message, [ channel.port2 ] );
		} ).then( ( data ) =>
		{
			// maybe cannot work.
			console.log( 'message:', data );
			return <SW_MESSAGE>data.data;
		} );
	}
}
