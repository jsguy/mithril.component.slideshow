/*	
	This creates google materials design lite mithril components
*/
;(function(){

var mithrilSlideshowComponent = function(m){
	m.components = m.components || {};

	var def = function(value, defValue) {
		return typeof value !== "undefined"? value: defValue;
	},
	mSlideshow = {
		attrs: function(attrs) {
			attrs = attrs || {};
			attrs.state = attrs.state || {};

			attrs.state.auto = def(attrs.state.auto, false);
			attrs.state.showButtons = def(attrs.state.showButtons, true);
			attrs.state.showDots = def(attrs.state.showDots, true);
			attrs.state.time = def(attrs.state.time, 7000);

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
			var me = this;

			me.attrs = mSlideshow.attrs(data);

			var numItems = me.attrs.state.imgs.length,
				auto = me.attrs.state.auto,
				time = me.attrs.state.time,
				inter,
				initAuto = function(){
					stopAuto();
					//	Set a time to advance
					if(typeof window != "undefined") {
						inter = window.setInterval(function(){
							me.next();
						}, time);
					}
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

		view: function(ctrl) {
			
			return m('div', {className: "mithril-slideshow", config: mSlideshow.config(ctrl, ctrl.attrs)}, [
				ctrl.attrs.state.imgs.map(function(img, idx){
					// return m('figure', {className: (idx == ctrl.currentSlide()? "show": "")},[
					// 	m('img', {src: img.src}),
					// 	(img.caption? m('figcaption', img.caption): undefined)
					// ]);
					return m('figure', {
							className: (idx == ctrl.currentSlide()? "show": ""),
							style: {"background-image": "url(" + img.src + ")"}
						},[
						//m('img', {src: img.src}),
						(img.caption? m('figcaption', img.caption): undefined)
					]);
				}),

				(ctrl.attrs.state.showDots? m('div', {className: "dots"},
					ctrl.attrs.state.imgs.map(function(img, idx){
						return m('span', {onclick: ctrl.setCurrentSlide(idx), className: "dot" + (idx == ctrl.currentSlide()? " current": "")}, m.trust("&#8226;"));
					})
				): undefined),
				(ctrl.attrs.state.showButtons? m('div', {className: "button-container"}, [
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