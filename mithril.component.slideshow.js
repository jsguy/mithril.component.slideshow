/*	
	This creates google materials design lite mithril components
*/
;(function(){

var mithrilSlideshowComponent = function(m){
	var cfgClasses = function(pFix, list, cfg){
		var result = "";
		for(i = 0; i < list.length; i += 1) {
			//	Add class if cfg has it
			result += cfg[list[i]]?
				" " + pFix + list[i]: 
				"";
		}
		return result;
	},
	//	Sets the arguments correctly for a component that
	//	can use args and inner values
	argifyComponent = function(component, args, inner){
		if(!inner){
			//	Inner is the 2nd argument, unless args is an object
			if(Object.prototype.toString.call(args) !== "[object Object]") {
				return m.component(component, {}, args);
			} else {
				return m.component(component, args);
			}
		} else {
			return m.component(component, args, inner);
		}
	},
	//	Excludes certain attributes
	attrExclude = function(args, exclude) {
		exclude = exclude || [];
		var result = {}, i;
		for(var i in args) {if(args.hasOwnProperty(i) && exclude.indexOf(i) == -1){
			result[i] = args[i];
		}}
		return result;
	},
	extend = function () {
		// copy reference to target object
		var target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false,
			options, name, src, copy, clone;

		// Handle a deep copy situation
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (typeof target !== "object" && !that.isFunction(target)) {
			target = {};
		}

		// extend jQuery itself if only one argument is passed
		if (length === i) {
			target = this;
			i -= 1;
		}

		for (; i < length; i += 1) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) !== null) {
				// Extend the base object
				for (name in options) {
					if (options.hasOwnProperty(name)) {
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy) {
							continue;
						}

						// Recurse if we're merging object literal values or arrays
						//	TODO: Implement the jQuery functions below...
						if (deep && copy && (that.isPlainObject(copy) || that.isArray(copy))) {
							clone = src && (that.isPlainObject(src) || that.isArray(src)) ? src : that.isArray(copy) ? [] : {};

							// Never move original objects, clone them
							target[name] = that.extend(deep, clone, copy);

							// Don't bring in undefined values
						} else if (copy !== undefined) {
							target[name] = copy;
						}
					}
				}
			}
		}

		// Return the modified object
		return target;
	},
	eleConfig = function(el, isInit) {
		if(!isInit) {
			//	Attach JS events for mdl
			if(typeof componentHandler !== "undefined") {
				componentHandler.upgradeElement(el);
			} else {
				if(typeof console !== "undefined"){
					console.error("componentHandler not found - please include google mdl in the page");
				}
			}
		}
	},
	//	These validations could be externalised
	validation = {
		numeric: "-?[0-9]*(\.[0-9]+)?"
	},
	//	Create a standard attributes / config object
	attrsConfig = function(def, attrs){
		attrs = attrs || {};
		attrs.state = attrs.state || {};

		//	Config is init function for MDL JS event
		def.config = eleConfig;

		if(attrs.config) {
			var oldAttrsConfig = attrs.config;
			attrs.config = function(){
				eleConfig.apply(this, arguments);
				oldAttrsConfig.apply(this, arguments);
			}
		}

		//	Grab old classname, setup cfg
		var defClassName = def.className || def["class"],
			cfg = extend(def, attrs);

		//	Set validation
		if(attrs.state.validate) {
			cfg.pattern = validation[attrs.state.validate]?
				validation[attrs.state.validate]:
				attrs.state.validate;
		}

		//	Extend again, as it may have a new pattern
		cfg = extend(cfg, attrs);

		var cfgClassName = cfg.className || cfg["class"];

		if(cfgClassName) {
			if(defClassName !== cfgClassName) {
				if(cfg["class"]) {
					cfg["class"] = defClassName + " " + cfg["class"];
				} else {
					cfg.className = defClassName + " " + cfg.className;
				}
			}
		}

		state = extend({}, cfg).state;
		delete cfg.state;
		return {cfg: cfg, state: state};
	};

	m.components = m.components || {};

	var mSlideshow = {
		attrs: function(attrs) {
			attrs = attrsConfig({
				state: {
					auto: true,
					time: 7000
				}
			}, attrs);

			return attrs;
		},
		controller: function(data){
			attrs = mSlideshow.attrs(data);

			var me = this,
				numItems = attrs.state.imgs.length,
				auto = attrs.cfg.auto,
				time = attrs.cfg.time,
				inter;

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
				//	Set a time to advance
				inter = window.setInterval(function(){
					me.next();
				}, time);
			}
		},

		view: function(ctrl, attrs) {
			return m('div', {}, [
				attrs.state.imgs.map(function(img, idx){
					return m('figure', {className: (idx == ctrl.currentSlide()? "show": "")},[
						m('img', {src: img.src}),
						(img.caption? m('figcaption', img.caption): undefined)
					]);
				}),

				m('div', {className: "dots"}, 
					attrs.state.imgs.map(function(img, idx){
						return m('span', {onclick: ctrl.setCurrentSlide(idx), className: "dot" + (idx == ctrl.currentSlide()? " current": "")}, m.trust("&#8226;"));
					})
				),

				m('span', {className: "prev", onclick: ctrl.prev}, m.trust("&laquo;")),
				m('span', {className: "next", onclick: ctrl.next}, m.trust("&raquo;"))
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