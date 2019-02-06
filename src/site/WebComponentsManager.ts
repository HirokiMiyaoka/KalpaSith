class WebComponentsManager
{
	private base: string;
	private tags: { [ key: string ]: HTMLScriptElement } = {};

	constructor( base: string = '' )
	{
		this.base = base;

		const define = customElements.define;
		customElements.define = ( name: string, constructor: Function, option?: ElementDefinitionOptions ) =>
		{
			if ( !this.tags[ name ] ) { this.exclude( name ); }
			define.call( customElements, name, constructor, option );
		};
	}

	private _suffix = '';
	get suffix() { return this._suffix; }
	set suffix( value: string ) { this._suffix = value ? '?' + value : ''; }

	public exclude( ... tags: string[] )
	{
		tags.forEach( ( tag ) =>
		{
			if ( !this.tags[ tag ] ) { this.tags[ tag ] = document.createElement( 'script' ); }
			if ( !this.tags[ tag ].hasAttribute( 'loaded' ) ) { this.tags[ tag ].setAttribute( 'loaded', '' ); }
		} );
	}

	public isExcluded( tag: string )
	{
		if ( !this.tags[ tag ] ) { return false; }
		return this.tags[ tag ].hasAttribute( 'loaded' ) && !this.tags[ tag ].src;
	}

	public isDefined( tag: string ) { return !!customElements.get( tag ); }

	public isLoad( tag: string ) { return !!this.tags[ tag ]; }

	public isLoaded( tag: string ) { return this.tags[ tag ] && this.tags[ tag ].hasAttribute( 'loaded' ); }

	private loadScript( tag: string )
	{
		tag = this.toLower( tag );
		if ( !this.tags[ tag ] )
		{
			// <script type="text/javascript" src="[ base + tag + .js ]"></script>
			this.tags[ tag ] = document.createElement( 'script' );
			if ( !customElements.get( tag ) )
			{
				console.log( 'load:', tag );
				this.tags[ tag ].type = 'text/javascript';
				this.tags[ tag ].onloadend = () => { this.tags[ tag ].setAttribute( 'loaded', '' ); };
				this.tags[ tag ].src = [ this.base, tag, '.js', this.suffix ].join( '' );
				document.head.appendChild( this.tags[ tag ] );
			}
		}
		return tag;
	}

	public load( tag: string )
	{
		tag = this.loadScript( tag );
		return customElements.whenDefined( tag ).then( () => { console.log( 'loaded:', tag ); } );
	}

	public async loadAsync( tags: string[] )
	{
		for ( let i = 0 ; i < tags.length ; ++i )
		{
			if ( this.isLoad( tags[ i ] ) ) { continue; }
			await this.load( tags[ i ] );
		}
	}

	private toLower( str: string )
	{
		return str.replace( /[A-Z]/g, ( char ) => { return String.fromCharCode( char.charCodeAt( 0 ) | 32 ); } );
	}

	private elementsList( parent: HTMLElement )
	{
		const data: { elements: HTMLElement[], customs: string[] } = { elements: [], customs: [] };

		const children = parent.children;
		for ( let i = children.length - 1 ; 0 <= i ; --i )
		{
			if ( children[ i ].tagName.includes( '-' ) && !data.customs.includes( children[ i ].tagName ) )
			{
				data.customs.push( this.toLower( children[ i ].tagName ) );
			}
			if ( !children[ i ].children.length ) { continue; }
			data.elements.push( <HTMLElement>children[ i ] );
		}

		return data;
	}

	public search( parent = document.body, all = false )
	{
		const elements = [ parent ];
		const customs: string[] = [];

		while( elements.length )
		{
			const element = <HTMLElement>elements.shift();
			const data = this.elementsList( element );
			data.customs.forEach( ( tag ) =>
			{
				if ( customs.includes( tag ) ) { return; }
				customs.push( tag );
			} );
			elements.push( ... data.elements );
		}

		return all ? customs : customs.filter( ( tag ) => { return !this.isLoaded( tag ) && !this.tags[ tag ] } );
	}

	public searchAndLoad( parent = document.body )
	{
		return Promise.all( this.search( parent ).map( ( tag ) => { return this.load( tag ); } ) );
	}

	public searchAndLoadAsync( parent = document.body )
	{
		return this.loadAsync( this.search( parent ) );
	}

}
