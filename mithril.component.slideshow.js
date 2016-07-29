/*	
	This creates google materials design lite mithril components
*/
;(function(){

var mithrilSlideshowComponent = function(m){
	m.components = m.components || {};

	var mSlideshow = {
		attrs: function(attrs) {
			attrs = attrs || {};
			attrs.state = attrs.state || {};

			attrs.state.auto = typeof attrs.state.auto !== "undefined"? 
				attrs.state.auto:
				false;

			attrs.state.showButtons = typeof attrs.state.showButtons !== "undefined"? 
				attrs.state.showButtons:
				true;

			attrs.state.showDots = typeof attrs.state.showDots !== "undefined"? 
				attrs.state.showDots:
				true;

			attrs.state.time = typeof attrs.state.time !== "undefined"?
				attrs.state.time:
				7000;

			return attrs;
		},

		//	Setup touch support using touch.js
		config: function(ctrl){
	        return function(element, isInitialized) {
	            if(typeof Touchit !== 'undefined') {
	                if (!isInitialized) {
	                	//	Note: if testing in chrome, use the "Nexus 6P" profile
						element.addEventListener('swipeleft',function(e){
							ctrl.prev();
						});

						element.addEventListener('swiperight',function(e){
							ctrl.next();
						});

						new Touchit(element);
	                }
	            } else {
	                console.warn('ERROR: You need touchit.js in the page');    
	            }
	        };
		},

		controller: function(data){
			attrs = mSlideshow.attrs(data);

			var me = this,
				numItems = attrs.state.imgs.length,
				auto = attrs.state.auto,
				time = attrs.state.time,
				inter,
				initAuto = function(){
					stopAuto();
					//	Set a time to advance
					inter = window.setInterval(function(){
						me.next();
					}, time);
				},
				stopAuto = function(){
					clearInterval(inter);
				};

			me.currentSlide = m.p(0);

			me.setCurrentSlide = function(idx){
				return function(){
					if(idx >= 0 && idx < numItems){
						me.currentSlide(idx);
					}
				};
			};

			me.prev = function(){
				me.currentSlide(me.currentSlide() > 0? 
					me.currentSlide() - 1:
					numItems - 1
				);
			};

			me.next = function(){
				me.currentSlide(me.currentSlide() < numItems -1? 
					me.currentSlide() + 1:
					0
				);
			};

			if(auto) {
				initAuto();
			}
		},

		view: function(ctrl, attrs) {
			return m('div', {className: "mithril-slideshow", config: mSlideshow.config(ctrl, attrs)}, [
				attrs.state.imgs.map(function(img, idx){
					return m('figure', {className: (idx == ctrl.currentSlide()? "show": "")},[
						m('img', {src: img.src}),
						(img.caption? m('figcaption', img.caption): undefined)
					]);
				}),

				(attrs.state.showDots? m('div', {className: "dots"},
					attrs.state.imgs.map(function(img, idx){
						return m('span', {onclick: ctrl.setCurrentSlide(idx), className: "dot" + (idx == ctrl.currentSlide()? " current": "")}, m.trust("&#8226;"));
					})
				): undefined),
				(attrs.state.showButtons? m('div', {className: "button-container"}, [
					m('span', {className: "prev", onclick: ctrl.prev}, m.trust("&laquo;")),
					m('span', {className: "next", onclick: ctrl.next}, m.trust("&raquo;"))
				]): undefined)
			]);
		}
	};

	m.components.mSlideshow = function(args){
		//	Sensible default settings
		return m.component(mSlideshow, args);
	};

	return m.components;
};

if (typeof module != "undefined" && module !== null && module.exports) {
	module.exports = mithrilSlideshowComponent;
} else if (typeof define === "function" && define.amd) {
	define(function() {
		return mithrilSlideshowComponent;
	});
} else {
	mithrilSlideshowComponent(typeof window != "undefined"? window.m || {}: {});
}

}());