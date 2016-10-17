/*	
	This creates a mithril slideshow component
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
			attrs.state.imgs = attrs.state.imgs || m.p([]);

			return attrs;
		},

		//	Setup touch support using touch.js
		config: function(ctrl){
	        return function(element, isInitialized) {
	            if(typeof Touchit !== 'undefined') {
	                if (!isInitialized) {
	                	var imgsElement = element.getElementsByClassName("mithril-slideshow-images")[0];

	                	//	Note: if testing in chrome, use the "Nexus 6P" profile
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

			var auto = me.attrs.state.auto,
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
					if(idx >= 0 && idx < me.attrs.state.imgs().length){
						me.currentSlide(idx);
					}
				};
			};

			me.prev = function(){
				me.currentSlide(me.currentSlide() > 0? 
					me.currentSlide() - 1:
					me.attrs.state.imgs().length - 1
				);
			};

			me.next = function(){
				me.currentSlide(me.currentSlide() < me.attrs.state.imgs().length -1? 
					me.currentSlide() + 1:
					0
				);
			};

			if(auto) {
				initAuto();
			}
		},

		view: function(ctrl, args) {
			var attrs = mSlideshow.attrs(args);

			return m('div', {className: "mithril-slideshow", config: mSlideshow.config(ctrl, attrs)}, [
				m('div', {className: "mithril-slideshow-images"},
					attrs.state.imgs().map(function(img, idx){
						return m('figure', {
								className: (idx == ctrl.currentSlide()? "show": ""),
								style: {"background-image": "url(" + img.src + ")"}
							},[
							(img.caption? m('figcaption', img.caption): undefined)
						]);
					})
				),

				(attrs.state.showDots? m('div', {className: "dots"},
					attrs.state.imgs().map(function(img, idx){
						return m('span', {onclick: ctrl.setCurrentSlide(idx), className: "dot" + (idx == ctrl.currentSlide()? " current": "")}, m.trust("&#8226;"));
					})
				): undefined),

				(attrs.state.showButtons? [
					m('span', {className: "prev", onclick: ctrl.prev}, m.trust("&laquo;")),
					m('span', {className: "next", onclick: ctrl.next}, m.trust("&raquo;"))
				]: undefined)
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

}());;;;(function(){
	var module = null;

;//	Mithril bindings.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(){
var mithrilBindings = function(m){
	m.bindings = m.bindings || {};

	//	Pub/Sub based extended properties
	m.p = function(value) {
		var self = this,
			subs = [],
			prevValue,
			delay = false,
			//  Send notifications to subscribers
			notify = function (value, prevValue) {
				var i;
				for (i = 0; i < subs.length; i += 1) {
					subs[i].func.apply(subs[i].context, [value, prevValue]);
				}
			},
			prop = function() {
				if (arguments.length) {
					value = arguments[0];
					if (prevValue !== value) {
						var tmpPrev = prevValue;
						prevValue = value;
						notify(value, tmpPrev);
					}
				}
				return value;
			};

		//	Allow push on arrays
		prop.push = function(val) {
			if(value.push && typeof value.length !== "undefined") {
				value.push(val);
			}
			prop(value);
		};

		//	Subscribe for when the value changes
		prop.subscribe = function (func, context) {
			subs.push({ func: func, context: context || self });
			return prop;
		};

		//	Allow property to not automatically render
		prop.delay = function(value) {
			delay = !!value;
			return prop;
		};

		//	Automatically update rendering when a value changes
		//	As mithril waits for a request animation frame, this should be ok.
		//	You can use .delay(true) to be able to manually handle updates
		prop.subscribe(function(val){
			if(!delay) {
				m.startComputation();
				m.endComputation();
			}
			return prop;
		});

		return prop;
	};

	//	Element function that applies our extended bindings
	//	Note: 
	//		. Some attributes can be removed when applied, eg: custom attributes
	//	
	m.e = function(element, attrs, children) {
		for (var name in attrs) {
			if (m.bindings[name]) {
				m.bindings[name].func.apply(attrs, [attrs[name]]);
				if(m.bindings[name].removeable) {
					delete attrs[name];
				}
			}
		}
		return m(element, attrs, children);
	};

	//	Add bindings method
	//	Non-standard attributes do not need to be rendered, eg: valueInput
	//	so they are set as removable
	m.addBinding = function(name, func, removeable){
		m.bindings[name] = {
			func: func,
			removeable: removeable
		};
	};

	//	Get the underlying value of a property
	m.unwrap = function(prop) {
		return (typeof prop == "function")? prop(): prop;
	};

	//	Bi-directional binding of value
	m.addBinding("value", function(prop) {
		if (typeof prop == "function") {
			this.value = prop();
			this.onchange = m.withAttr("value", prop);
		} else {
			this.value = prop;
		}
	});

	//	Bi-directional binding of checked property
	m.addBinding("checked", function(prop) {
		if (typeof prop == "function") {
			this.checked = prop();
			this.onchange = m.withAttr("checked", prop);
		} else {
			this.checked = prop;
		}
	});

	//	Hide node
	m.addBinding("hide", function(prop){
		this.style = {
			display: m.unwrap(prop)? "none" : ""
		};
	}, true);

	//	Toggle value(s) on click
	m.addBinding('toggle', function(prop){
		this.onclick = function(){
			//	Toggle allows an enum list to be toggled, eg: [prop, value2, value2]
			var isFunc = typeof prop === 'function', tmp, i, vals = [], val, tVal;

			//	Toggle boolean
			if(isFunc) {
				value = prop();
				prop(!value);
			} else {
				//	Toggle enumeration
				tmp = prop[0];
				val = tmp();
				vals = prop.slice(1);
				tVal = vals[0];

				for(i = 0; i < vals.length; i += 1) {
					if(val == vals[i]) {
						if(typeof vals[i+1] !== 'undefined') {
							tVal = vals[i+1];
						}
						break;
					}
				}
				tmp(tVal);
			}
		};
	}, true);

	//	Set hover states, a'la jQuery pattern
	m.addBinding('hover', function(prop){
		this.onmouseover = prop[0];
		if(prop[1]) {
			this.onmouseout = prop[1];
		}
	}, true );

	//	Add value bindings for various event types 
	var events = ["Input", "Keyup", "Keypress"],
		createBinding = function(name, eve){
			//	Bi-directional binding of value
			m.addBinding(name, function(prop) {
				if (typeof prop == "function") {
					this.value = prop();
					this[eve] = m.withAttr("value", prop);
				} else {
					this.value = prop;
				}
			}, true);
		};

	for(var i = 0; i < events.length; i += 1) {
		var eve = events[i];
		createBinding("value" + eve, "on" + eve.toLowerCase());
	}


	//	Set a value on a property
	m.set = function(prop, value){
		return function() {
			prop(value);
		};
	};

	/*	Returns a function that can trigger a binding 
		Usage: onclick: m.trigger('binding', prop)
	*/
	m.trigger = function(){
		var args = Array.prototype.slice.call(arguments);
		return function(){
			var name = args[0],
				argList = args.slice(1);
			if (m.bindings[name]) {
				m.bindings[name].func.apply(this, argList);
			}
		};
	};

	return m.bindings;
};

if (typeof module != "undefined" && module !== null && module.exports) {
	module.exports = mithrilBindings;
} else if (typeof define === "function" && define.amd) {
	define(function() {
		return mithrilBindings;
	});
} else {
	mithrilBindings(typeof window != "undefined"? window.m || {}: {});
}

}());;

}());;//  Ref: https://github.com/rasismeiro/touch
//  Note: renamed to Touchit, so we leave the native method alone
//  Also removed the prevent default, as that stops you from being able to scroll past
(function(w,d) {
  
  "use strict";
  
  w.Touchit = function(id) {
    var t = {
      t: ['up', 'right', 'down', 'left'],
      tt: 300, tp: 150, dtp: 222, td: Math.round(30 / window.devicePixelRatio), lt: -1, 
      ltt: null, s : null, fn: [], e: null, o: null,
      p1: {x: 0, y: 0, t: 0},
      p2: {x: 0, y: 0, t: 0},
      distance: function() {
        return Math.round(Math.sqrt(Math.pow((this.p1.x - this.p2.x), 2) + Math.pow((this.p1.y - this.p2.y), 2)));
      },
      angle: function() {
        var d = Math.abs(this.p2.x - this.p1.x);
        return Math.round(Math.acos(d / Math.sqrt(Math.pow(d, 2) + Math.pow(this.p2.y - this.p1.y, 2))) * 57.3);
      },
      reset: function() {
        var target = this.e.touches.item(0);
        this.p1.x = target.clientX;
        this.p1.y = target.clientY;
        this.p1.t = this.e.timeStamp;
        this.p2.x = this.p1.x;
        this.p2.y = this.p1.y;
        this.p2.t = this.p1.t;
      },
      update: function() {
        var target = this.e.touches.item(0);
        this.p2.t = this.e.timeStamp;
        this.p2.x = target.clientX;
        this.p2.y = target.clientY;
      },
      direction: function() {
        return (this.angle() > 45) ? ((this.p1.y < this.p2.y) ? 2 : 0) : ((this.p1.x < this.p2.x) ? 1 : 3);
      },
      time: function() {
        return this.p2.t - this.p1.t;
      },   
      on: function(event, fn) {
        this.fn[event] = fn;
        return this;
      },
      swipe: function() {
        var f = 'swipe' + this.t[this.direction()];
        var e = new CustomEvent(f);
        this.o.dispatchEvent(e);        
        if ('function' === typeof(this.fn[f])) {
          this.fn[f](this.o);
        }        
      },
      pinch: function() {
        var e, n = 'pinch',dt = {scale : this.e.scale, style: this.s},
            p = {bubbles: false, cancelable: false, detail: dt};    
        if (this.e.scale < 1.0) {
          e = new CustomEvent('pinchout',p);
          e.scale = this.e.scale;
          e.style = dt.style;
          this.o.dispatchEvent(e);
          if ('function' === typeof this.fn[n+'out']) {
             this.fn[n+'out'](this.o, dt.scale, dt.style);
          }
        } else if (this.e.scale > 1.0){
          e = new CustomEvent('pinchin',p);
          e.scale = this.e.scale;
          e.style = dt.style;
          this.o.dispatchEvent(e);
          if ('function' === typeof this.fn[n+'in']){
             this.fn[n+'in'](this.o, this.e.scale, this.s);
          }
        }
      },
      tap: function(){
         var e = new CustomEvent('tap');
         this.o.dispatchEvent(e);
         if ('function' === typeof this.fn.tap){
           this.fn.tap(this.o);
         }
      },
      dbltap: function (){
        var e = new CustomEvent('dbltap');
        this.o.dispatchEvent(e);
        if ('function' === typeof this.fn.dbltap){
           this.fn.dbltap(this.o);
         }
      }
    };
    
    var CustomEvent = function(e, p) {
        p = p || {bubbles: false, cancelable: false, detail: undefined};
        var evt = d.createEvent('CustomEvent');
        evt.initCustomEvent(e, p.bubbles, p.cancelable, p.detail);
        return evt;
    };
    CustomEvent.prototype = w.CustomEvent.prototype;
    w.CustomEvent = CustomEvent;

    t.o = ('object' !== typeof id) ? d.getElementById(id) : id;

    if (null !== t.o) {
      t.o.addEventListener('touchstart', function(e){
        t.e = e;
        t.reset();
      }, false);

      t.o.addEventListener('touchmove', function(e){
        t.e = e;
        t.update();
      }, false);

      t.o.addEventListener('touchend', function(e){                
        t.e = e;        
        t.p2.t = e.timeStamp;
        var d, dd = t.distance(), tt = t.time();        
        if ((dd > t.td) && (tt < t.tt)){
          t.swipe();
        } else if (dd < 5 && tt < t.tp){
          if (t.lt<0){t.lt = e.timeStamp;}          
          d = e.timeStamp - t.lt;          
          t.lt = e.timeStamp;          
          if (d>10 && d<t.dtp) {
            w.clearTimeout(t.ltt);
            t.dbltap();
          } else {
            t.ltt = w.setTimeout(function(){t.tap();},t.dtp);
          }
          
        }
      }, false);

      t.o.addEventListener('gesturestart', function(e){
        t.e = e;
        var i,j,s = [], style = w.getComputedStyle(t.o, null);
        for(i = 0, j = style.length; i < j; i++){
           s[style[i]] = style.getPropertyValue(style[i]);
        }
        t.s = s;
      }, false);

      t.o.addEventListener('gesturechange', function(e){
        t.e = e;
        t.pinch();
      }, false);

      t.o.addEventListener('gestureend', function(e){        
        t.p1.t = e.timeStamp - (t.tt + 1);
        t.p2.t = e.timeStamp;       
      }, false);
    }
    return t;
  };
})(typeof window != "undefined"? window: {}, typeof document != "undefined"? document: {});