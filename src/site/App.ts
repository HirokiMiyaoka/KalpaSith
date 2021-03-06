const App = ( ( script: HTMLScriptElement ) =>
{
	function GetApp()
	{
		const kalpa = <KalpaSith>document.querySelector( 'kalpa-sith' );
		if ( kalpa ) { app.main = () => { return kalpa; }; }
		return kalpa;
	}

	function Wait() { return customElements.whenDefined( 'kalpa-sith' ); }

	function Load( ... components: string[] ) { return app.main().loadComponents( ... components ); }

	function ClearElements( element: HTMLElement )
	{
		if ( !element ) { return; }
		const children = element.children;
		for ( let i = children.length - 1 ; 0 <= i ; --i ) { element.removeChild( children[ i ] ); }
	}

	function Fetch( input: RequestInfo, init?: RequestInit )
	{
		return fetch( input, init ).then( ( result ) =>
		{
			if ( result.ok ) { return result; }
			throw result;
		} );
	}

	function FetchJson<T>( input: RequestInfo, init?: RequestInit )
	{
		return fetch( input, init ).then( ( result ) =>
		{
			if ( result.ok ) { return <Promise<T>>result.json(); }
			return result.json().then( ( result ) => { throw result; } );
		} );
	}

	function FetchText( input: RequestInfo, init?: RequestInit )
	{
		return fetch( input, init ).then( ( result ) =>
		{
			if ( result.ok ) { return result.text(); }
			return result.text().then( ( result ) => { throw result; } );
		} );
	}

	const app =
	{
		script: script,
		main: GetApp,
		wait: Wait,
		load: Load,
		clear: ClearElements,
		fetch: Fetch,
		fetchJson: FetchJson,
		fetchText: FetchText,
	};

	return app;
} )( <HTMLScriptElement>document.currentScript );
