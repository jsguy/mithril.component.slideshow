/*
	This creates a mithril slideshow component
	Requires: ulib.pubsub.js
	TODO: Add automatic build.
*/
;(function(){

var mithrilSlideshowComponent = function(m){
	m.components = m.components || {};

	var extend = function(o1, o2){
		for(var i in o2) {if(o2.hasOwnProperty(i)){
			o1[i] = o2[i];
		}}
		return o1;
	},
	mSlideshow = {
		attrs: function(attrs) {
			attrs = attrs || {};
			attrs.state = attrs.state || {};

			//	Sensible defaults
			attrs.state = extend({
				auto: false,
				showButtons: true,
				showDots: true,
				time: 7000,
				imgs: m.p([])
			}, attrs.state);

			return attrs;
		},

		//	Setup touch support using touch.js
		config: function(ctrl){
	        return function(element, isInitialized) {
	            if(typeof Touchit !== 'undefined') {
					if (!isInitialized) {
	                	var imgsElement = element.getElementsByClassName("mithril-slideshow-images")[0];

	                	//	Note: if testing in chrome, use the "Nexus 6P" profile, not iPhone, as it won't work.
						imgsElement.addEventListener('swipeleft',function(e){
							ctrl.next();
						});

						imgsElement.addEventListener('swiperight',function(e){
							ctrl.prev();
						});

						new Touchit(imgsElement);
	                }
	            } else {
	                console.warn('ERROR: You need touchit.js in the page');
	            }
	        };
		},

		controller: function(data){
			var me = this;

			me.attrs = mSlideshow.attrs(data);

			me.events = new ulib.Pubsub();

			var auto = me.attrs.state.auto,
				time = me.attrs.state.time,
				inter,
				initAuto = function(){
					stopAuto();
					inter = setInterval(function(){
						me.next();
					}, time);
				},
				stopAuto = function(){
					clearInterval(inter);
				};

			me.currentSlide = m.p(0);

			me.setCurrentSlide = function(idx){
				return function(){
					me.events.trigger('beforeSetSlide', me);
					if(idx >= 0 && idx < me.attrs.state.imgs().length){
						me.currentSlide(idx);
					}
					me.events.trigger('setSlide', me);
				};
			};

			me.prev = function(){
				me.events.trigger('beforePrev', me);
				me.currentSlide(me.currentSlide() > 0?
					me.currentSlide() - 1:
					me.attrs.state.imgs().length - 1
				);
				me.events.trigger('prev', me);
			};

			me.next = function(){
				me.events.trigger('beforeNext', me);
				me.currentSlide(me.currentSlide() < me.attrs.state.imgs().length -1?
					me.currentSlide() + 1:
					0
				);
				me.events.trigger('next', me);
			};

			if(auto) {
				initAuto();
			}

			//	Subscribe to events, note: you can have multiple events per event type in a list
			if(me.attrs.state.events) {
				for(var i in me.attrs.state.events) {if(me.attrs.state.events.hasOwnProperty(i)){
					if(typeof me.attrs.state.events[i] === "function") {
						me.events.on(i, me.attrs.state.events[i]);
					} else if(me.attrs.state.events[i].length){
						for(var j = 0; j < me.attrs.state.events[i].length; j += 1) {
							me.events.on(i, me.attrs.state.events[i][j]);
						}
					}
				}}
			}
		},

		view: function(ctrl, args) {
			//	Update the attrs, in acse they changed.
			ctrl.attrs = mSlideshow.attrs(args);
			if(ctrl.currentSlide() > ctrl.attrs.state.imgs().length -1) {
				ctrl.currentSlide(0);
			}

			return m('div', {className: "mithril-slideshow", config: mSlideshow.config(ctrl, ctrl.attrs)}, [
				m('div', {className: "mithril-slideshow-images"},
					ctrl.attrs.state.imgs().map(function(img, idx){
						var result = m('figure', {
								className: (idx == ctrl.currentSlide()? "show": ""),
								style: {"background-image": "url(" + img.src + ")"}
							},[
							(img.caption? m('figcaption', img.caption): undefined)
						]);
						return img.decorate? img.decorate(img, idx, ctrl): result;
					})
				),

				(ctrl.attrs.state.showDots? m('div', {className: "dots"},
					ctrl.attrs.state.imgs().map(function(img, idx){
						return m('span', {onclick: ctrl.setCurrentSlide(idx), className: "dot" + (idx == ctrl.currentSlide()? " current": "")}, m.trust("&#8226;"));
					})
				): undefined),

				(ctrl.attrs.state.showButtons? [
					m('span', {className: "prev", onclick: ctrl.prev}, m.trust("&laquo;")),
					m('span', {className: "next", onclick: ctrl.next}, m.trust("&raquo;"))
				]: undefined)
			]);
		}
	};

	//	Init function
	m.components.mSlideshow = function(args){
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

}());;
