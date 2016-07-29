# mithril slideshow component

This creates a slideshow in mithril

## Install

```javascript
npm install mithril.component.slideshow
```

## Usage

First include mithril.js, and the js and css files:

```markup
&lt;script src="lib/mithril.js"&gt;&lt;/script&gt;
&lt;script src="dist/mithril.component.slideshow.js"&gt;&lt;/script&gt;
&lt;link rel="stylesheet" type="text/css" href="dist/mithril.component.slideshow.css"&gt;
```

Then in your view, simply initialise with the images you want to show, using the state:

```javascript
return m.components.mSlideshow({state: {
	imgs: [
		{src: "img/uboat.jpg"},
		{src: "img/bridge.jpg"}
	]
}});
```

You can optionally set the following attributes:

* **auto** - should we automatically advance, default is false
* **time** - the amount of milliseconds the slideshow waits before advancing, default is 7000
* **showButtons** - should we show the left/right buttons, default is true
* **showDots** - should we show dots at the bottom, default is true
