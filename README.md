# KalpaSith

Lightweight SPA library.

You can add Markdown page.
And auto load WebComponents.

## Module

Module created by WebComponents.

```ts
class Module extends HTMLElement implements KalpaSithModule
{

	public isSupported( path: string ) { return true; }

	public render( path = location.pathname ) { return Promise.resolve(); }
}
```

If `mod.isSupported( PATH )` return true, KalpaSith exec `mod.render()` and `appendchild()`.
