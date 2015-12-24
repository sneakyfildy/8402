/*!
 * @file DO NOT MODIFY THIS FILE, IT IS COMPILED!
 */
(function(global, undefined) {
var ClassManager = (function (){
	return (function() {
		var IS_DONTENUM_BUGGY = (function() {
			for (var p in {toString: 1}) {
				/* istanbul ignore else */
				if (p === 'toString')
					return false;
			}
			/* istanbul ignore next */
			return true;
		})();

		function subclass() {}
		/**
		 * Core class creation and inheritance setup.
		 * @private
		 * @returns {Function}
		 */
		function create() {
			var parent = null, properties = U.toArray(arguments);
			if ($.isFunction(properties[0])) {
				parent = properties.shift();
			}
            // ['extends'] is to please IE
			if ( !parent &&  properties[0] && !!properties[0]['extends'] ){
				parent = U.ClassManager.get(properties[0]['extends'] + '');
			}

			function uComponent() {
				//TODO: move somewhere, maybe into AbstractComponent
				if ( this.mixins && $.isArray(this.mixins) ){
					U.each(this.mixins, function(mixinDef){
						if ( !mixinDef || $.isEmptyObject(mixinDef) ){ return; }
						U.eachKey(mixinDef, function(mixinPropName, mixinClassName){
							this[mixinPropName] = U.cc(mixinClassName); // no copy
						}, this);
					}, this);
				}
				this.initComponent.apply(this, arguments);
			}

			U.apply(uComponent, U.ClassManager.Methods);
			uComponent.superclass = parent;
			uComponent.subclasses = [];

			if (parent) {
				subclass.prototype = parent.prototype;
				uComponent.prototype = new subclass;
				parent.subclasses.push(uComponent);
			}

			for (var i = 0, length = properties.length; i < length; i++)
				uComponent.addMethods(properties[i]);

			if (!uComponent.prototype.initComponent)
				uComponent.prototype.initComponent = U.emptyFn;

			uComponent.prototype.constructor = uComponent;

			return uComponent;
		}

		/**
		 * The most important method.
		 * Creates new class by its definition.
		 * ParentClass may not be supplied.
		 * Required param for config object is className.
		 *
		 * Fully compatible with this manual:
		 * <a href="http://prototypejs.org/learn/class-inheritance">http://prototypejs.org/learn/class-inheritance</a>
		 *
		 * Have additional features: className and utype configs.
		 * Read {@link U.ClassManager} description
		 *
		 * @alias U#define
		 */
		function define(){
			var parent = null,
				config = void(0),
				properties = U.toArray(arguments),
				newClass;

			if ($.isFunction( properties[0]) ) {
				parent = properties[0];
			}

			if ( typeof properties[1] !== 'undefined' ){
				config = properties[1];
			}else if( parent === null && typeof properties[0] !== 'undefined' ){
				config = properties[0];
			}else{
				throw 'Cannot detect class config object';
			}

			if ( !parent && !!config['extends'] ){
				parent = U.ClassManager.get(config['extends'] + '');
			}

			if ( !config || !config.className ){
				throw 'Please provide class config object with correct className';
			}

			if ( $.isFunction( U.ClassManager.get(config.className) ) ){
				throw 'Class with such className is already defined';
			}

			newClass = U.ClassManager.create.apply(U.ClassManager, arguments);

			U.ClassManager.regClass(config.className, newClass);

			if ( config && config.singleton === true ){
				U[config.className] = U.cc(config.className);
				U.ClassManager.unregClass(config.className);
				return;
			}

			if ( config && config.utype ){
				U.ClassManager.regType(config.utype, config.className);
			}
		}

		/**
		 * Registrate new short alias (utype) for class with provided utype.
		 * This is a link to one of U.ClassManager.classes properties (class)
		 * @private
		 * @param {String} type Name for the utype
		 * @param {String} className Class definition
		 */
		function regType(type, className){
			if ( !$.isFunction(U.ClassManager.get(className)) ){
				throw 'No such class: ' + className;
			}

			U.ClassManager.types[type] = U.ClassManager.get(className);
		}

		/**
		 * Registrate new class with provided class name.
		 * @private
		 * @param {String} classname Name for the class
		 * @param {Function} newClass Class definition
		 */
		function regClass(classname, newClass){
			U.ClassManager.classes[classname] = newClass;
		}
		/**
		 * Removes class from registered.
		 * @private
		 * @param {String} classname Name for the class
		 */
		function unregClass(classname){
			delete U.ClassManager.classes[classname];
		}
		/**
		 * Returns class by classname
		 * @param {String} className Name of the class
		 * @returns {Function}
		 */
		function get(className){
			return U.ClassManager.classes[className];
		}

		/**
		 * Returns class by alias (utype)
		 * @param {String} typeName Name of the class
		 * @returns {Function}
		 */
		function getByType(typeName){
			return U.ClassManager.types[typeName];
		}
		/**
		 * Do not touch this. Almost full copy from PrototypeJS
		 * @private
		 * @param {Object} source
		 * @returns {Object}
		 */
		function addMethods(source) {
			var ancestor = this.superclass && this.superclass.prototype,
				properties = Object.keys(source);
			// cannot test outdated browsers support
			/* istanbul ignore if */
			if (IS_DONTENUM_BUGGY) {
				if (source.toString !== Object.prototype.toString) {
					properties.push('toString');
				}
				if (source.valueOf !== Object.prototype.valueOf) {
					properties.push('valueOf');
				}
			}

			for (var i = 0, length = properties.length; i < length; i++) {
				var property = properties[i], value = source[property];
				if (ancestor && $.isFunction(value) && value.argumentNames()[0] === "$super") {
					var method = value;
					value = (function(m) {
						return function() {
							return ancestor[m].apply(this, arguments);
						};
					})(property).wrap(method);

					value.valueOf = (function(method) {
						/* istanbul ignore next */
						return function() {
							return method.valueOf.call(method);
						};
					})(method);

					value.toString = (function(method) {
						/* istanbul ignore next */
						return function() {
							return method.toString.call(method);
						};
					})(method);
				}
				this.prototype[property] = value;
			}

			return this;
		}

		return {
			create: create,
			define: define,
			regType: regType,
			regClass: regClass,
			unregClass: unregClass,
			get: get,
			getByType: getByType,
			types: {},
			classes: {},
			Methods: {
				addMethods: addMethods
			}
		};
	})();
}).call(global),
U_Core = (function (
	ClassManager
){
	/**
	 * @class BSNotify
	 * Type of object. Read more here
	 * <a href="http://bootstrap-growl.remabledesigns.com/" target="_blank">http://bootstrap-growl.remabledesigns.com/</a>
	 */
	//
	/**
	 *
	 * @class jQuery
	 * <a href="api.jquery.com">api.jquery.com</a> *
	 * Added to prevent errors with 'unknown' object type in jsDoc.
	 */

	// several required polyfills
	(function(){
		/**
		 * @class String
		 */
		/* istanbul ignore else */
		if ( !String.prototype.format ){
			/**
			* String object extension
			* usage: '{0} foo {1} bar'.format('this is', 'and that is')
			* @param {String} initial string
			* @param {String} any number of replacements
			*/
			String.prototype.format = function() {
				var s = String(this),
					i = arguments.length;

				while (i--) {
					s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
				}
				return s;
			};
		}
	})();
	// PrototypeJS
	Function.prototype.argumentNames = function(){
		var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
		  .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
		  .replace(/\s+/g, '').split(',');

		return names.length === 1 && !names[0] ? [] : names;
	};

	Function.prototype.wrap = function(wrapper) {
		function update(array, args) {
			var arrayLength = array.length, length = args.length;
			while (length--)
				array[arrayLength + length] = args[length];
			return array;
		}
		var __method = this;
		return function() {
			var a = update([__method.bind(this)], arguments);
			return wrapper.apply(this, a);
		};
	};


	/**
	 * @class jqEvent
	 */
	/**
	 * @class jqXHR
	 * As of jQuery 1.5, the $.ajax() method returns the jqXHR object,
	 * which is a superset of the XMLHTTPRequest object. For more information,
	 * ee the <a href="http://api.jquery.com/jQuery.ajax/#jqXHR">jqXHR section of the $.ajax entry</a>
	 */

	/**
	 * Some explanation and thoughts:
	 * - This U-library must contain as much projects-common stuff as possible to reduce copy-paste
	 *	and double functionality.
	 *	@class U
	 *	@requires jQuery
	 *
	 */
	var U = U || {};

	// basic methods
	(function(){
		/**
		 * Test-friendly version.
		 * @param {Boolean} forceSet Set to true to force enumerables (used to please karma coverage)
		 * @private
		 * @chainable
		 * @returns {U}
		 */
		U.updateEnumerables = function(forceSet){
			var enumerables = true,
				enumerablesTest = {toString: 1},
				i;
			for (i in enumerablesTest) {
				enumerables = null;
			}
			if (enumerables || forceSet === true) {
				enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable',
							   'toLocaleString', 'toString', 'constructor'];
			}
			/**
			 * An array containing extra enumerables for old browsers
			 * @property {String[]|null}
			 */
			U.enumerables = enumerables;
			return U;
		};
		/**
		 * Copies all the properties of config to the specified object.
		 * TODO: move merge also
		 * @param {Object} object Receiver
		 * @param {Object} config Source
		 * @param {Object} [defaults] A different object that will also be applied for default values
		 * @return {Object} returns obj
		 */
		U.apply = function(object, config, defaults) {
			if (defaults) {
				U.apply(object, defaults);
			}

			if (!object || !config || typeof config !== 'object') {
				return object;
			}
			var i, j, k;

			for (i in config) {
				object[i] = config[i];
			}

			if (U.enumerables) {
				for (j = U.enumerables.length; j--;) {
					k = U.enumerables[j];
					if (config.hasOwnProperty(k)) {
						object[k] = config[k];
					}
				}
			}
			return object;
		};

		U.updateEnumerables();

		U.apply(U, {

			/**
			 * @property {Function}
			 * A reusable empty function
			 */
			emptyFn: function (){},
			getEmpty$: function(){return $();},
			/**
			 * Copies all the properties of config to object if they don't already exist.
			 * @param {Object} object The receiver of the properties
			 * @param {Object} config The source of the properties
			 * @return {Object} returns obj
			 */
			applyIf: function(object, config) {
				var property;

				if (object) {
					for (property in config) {
						if (object[property] === undefined) {
							object[property] = config[property];
						}
					}
				}

				return object;
			},

			/**
			 * Component creation
			 * @param {Object|String} componentConfig May be config object or classname string.
			 * @returns {undefined}
			 */
			createComponent: function(componentConfig){
				var component, classDef;

				if ( U.isString(componentConfig) ){
					componentConfig = {
						className: componentConfig
					};
				}
				if ( !U.ClassManager.get(componentConfig.className) &&
					!!U[componentConfig.className] ){
					throw 'You are trying to create another instance of singleton class "' + componentConfig.className + '"';
				}
				if ( componentConfig.utype && !U.ClassManager.getByType(componentConfig.utype) ){
					throw 'No such type: ' + componentConfig.utype;
				}

				if ( componentConfig.className && !U.ClassManager.get(componentConfig.className) ){
					throw 'No such class: ' + componentConfig.className;
				}

				classDef = U.ClassManager.getByType(componentConfig.utype) || U.ClassManager.get(componentConfig.className);
				componentConfig.id = U.id();
				component = new classDef(componentConfig);
				if ( componentConfig.ref ){
					this[componentConfig.ref] = component;
					component.refOwner = this;
					component.refName = componentConfig.ref;
					delete component.ref;
				}

				return component;
			},

			/**
			 * Iterates an array or an iterable value and invoke the given callback function for each item.
			 *
			 * @param {Array/NodeList/Object} iterable The value to be iterated.
			 * @param {Function} callbackFn Callback function.
			 * @param {Object} callbackFn.item $.each alike
			 * @param {Number} callbackFn.index $.each alike
			 * @param {Array} callbackFn.allItems
			 * @param {Boolean} callbackFn.return Return false to stop iteration and return iterated index
			 * @param {Object} [scope] The scope in which the specified function is executed.
			 * @return {Boolean} false if each is completed, index if not
			 */
			each: function(iterable, callbackFn, scope) {
				iterable = U.toArray(iterable);
				var i, l = iterable.length;

				for (i = 0; i < l; i++) {
					if (callbackFn.call(scope || iterable[i], iterable[i], i, iterable) === false) {
						return i;
					}
				}
				return true;
			},

			/**
			 * Must be called on objects.
			 * Iterates keys, invoking callback
			 * @param {Object} object The object to be iterated.
			 * @param {Function} callbackFn Callback function.
			 * @param {String} callbackFn.key Property name
			 * @param {Mixed} callbackFn.value Property value
			 * @param {Object} callbackFn.object Initial object
			 */
			eachKey: function(object, callbackFn, scope) {
				for (var property in object) {
					if (object.hasOwnProperty(property) && callbackFn.call(scope || object, property, object[property], object) === false) {
						return;
					}
				}
			},

			/**
			 * Converts a value to an array if it's not already an array.
			 * Return variants:
			 * - An empty array if given value is undefined or null
			 * - Unchanged value if value is an array
			 * - Array copy if value is iterable entity (arguments)
			 * - Else - Array with one item - given value.
			 *
			 * @param {Object} value The value to convert to an array
			 * @param {Boolean} splitString Set to true to split strings
			 * TODO: works unexpected;y on DOM nodes. Do not use together.
			 * @return {Array} array
			 */
			toArray: function(value, splitString) {
				var createdArray = [], i, type = typeof value;

				if (type === 'undefined' || value === null) {
					return [];
				}

				if ( $.isArray(value) ) {
					return value;
				}

				if ( value && value.length !== undefined && (type !== 'function' || !value.apply) ){
					if ( U.isString(value) ){
						return splitString === true ? value.split('') : [value];
					}
					for (i = 0; i < value.length; i++) {
						createdArray.push(value[i]);
					}
					return createdArray;
				}
				return [value];
			},
			/**
			 * Returns true if the passed value is a JavaScript Function, false otherwise.
			 * @param {Object} value The value to test
			 * @return {Boolean}
			 * @method
			 */
			isFunction:
			// Safari 3.x and 4.x returns 'function' for typeof <NodeList>, hence we need to fall back to using
			// Object.prototype.toString (slower)
			(typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') ?
			/* istanbul ignore next */
			function(value) {
				return Object.prototype.toString.call(value) === '[object Function]';
			} :
			function(value) {
				return typeof value === 'function';
			},
			/**
			 * Returns true if the passed value is a number. Returns false for non-finite numbers.
			 * @param {Object} value The value to test
			 * @return {Boolean}
			 */
			isNumber: function(value) {
				return typeof value === 'number' && isFinite(value);
			},
            /**
             *
             * Returns 'true' if the passed value is a js date object, 'false' otherwise.
             * @param {Object} object What to test.
             * @return {Boolean}
            */
            isDate: function(value) {
                // invalid dates ( new Date('hello') ) will return true, it was done intentionally
                return Object.prototype.toString.call(value) === '[object Date]';
            },
			/**
			 * Checks whether typoef what is 'undefined'
			 * @param {String|Boolean|Number|Object|Function|Mixed} what What is needed to be checked
			 * @returns {Boolean}
			 */
			isDefined: function(what){
				return typeof what !== 'undefined';
			},
			notDefined: function(what){
				return !U.isDefined(what); // TODO test
			},
			/**
			 * True if all arguments are defined
			 * @returns {Boolean}
			 */
			areDefined: function(){
				var toCheck = Array.prototype.slice.call(arguments),
					res = true;
				U.each(toCheck || [], function(item){
					if ( !U.isDefined(item) ){
						res = false;
						return false; // exit each
					}
				});
				// TODO: tests!
				return res;
			},
			/**
			 * Returns true if the passed value is a string.
			 * @param {Object} value The value to test
			 * @return {Boolean}
			 */
			isString: function(value) {
				return typeof value === 'string';
			},
			/**
			 * Returns true if the passed value is a JavaScript Array, false otherwise.
			 * More test-friendly
			 * @param {Object} target The target to test
			 * @return {Boolean}
			 * @method
			 */
			isArray: function(value){
				var method = ('isArray' in Array && typeof Array.isArray === 'function') ? Array.isArray : function(value) {
					return Object.prototype.toString.call(value) === '[object Array]';
				};
				return method.call(Array, value);
			},
			/**
			 * Returns true if the passed value is empty, false otherwise. The value is deemed to be empty if it is either:
			 *
			 * - `null`
			 * - `undefined`
			 * - a zero-length array
			 * - a zero-length string (Unless the `allowEmptyString` parameter is set to `true`)
			 *
			 * @param {Object} value The value to test
			 * @param {Boolean} [allowEmptyString] true to allow empty strings (defaults to false)
			 * @return {Boolean}
			 * TODO: tests
			 */
			isEmpty: function(value, allowEmptyString) {
				// TODO add isEmptyObject maybe? Can {} be assumed 'empty'? Or just use $.isEmptyObject
				return (value === null) || !U.isDefined(value) || (!allowEmptyString ? value === '' : false) || (U.isArray(value) && value.length === 0);
			},
			/**
			 * Returns true if items is jQuery item
			 * @param {Object} item
			 * @returns {Boolean}
			 */
			is$: function(item){
				// absent jQuery will cause a lot more trouble, so ignore,
				// to omit attempts to fake jQuery existance
				/* istanbul ignore if */
				if ( typeof jQuery === 'undefined' ){
					throw 'jQuery not found, cannot compare';
				}
				return item instanceof jQuery;
			},
			/**
			 * Returns deepest first element of Array. Used to extract values from
			 * that urlParams object.
			 * @param {Array} what
			 * @returns {Mixed}
			 */
			deepestFirst: function(what){
				var copy = what && what.slice && what.slice() || what;
				while ( $.isArray(copy) ){
					copy = copy[0];
				}

				return copy;
			},
			/**
			 * Applies {@link U.deepestFirst} on every input array item
			 * @param {Array} input Please send array, input will be sanitized by U.toArray
			 * @returns {Array} flattened clone of input
			 */
			deepestFirstBatch: function(input){
				// TODO: tests
				var localInput = (U.toArray(input)).slice();
				U.each(localInput, function(hideItem, index, arr){
					arr[index] = U.clone(U.df(hideItem));
				});
				return localInput;
			},
			/**
			* Throttled function
			* Returns new function, throttled by some amount of time
			* @param {Number} timesPerSecond
			* @param {Function} originalFn
			* @param {Object} originalFnScope
			*/
			throttledFunction: function(timesPerSecond, originalFn, originalFnScope, returnLast){
				var callArgs = Array.prototype.slice.call(arguments, 3)
					,me = this;

				originalFnScope = originalFnScope || window;
				timesPerSecond = Math.abs(timesPerSecond) || 1000;

				this.interval = 1000 / timesPerSecond;
				this.originalFn = originalFn;
				this.returnLast = !!returnLast;
				this.run = function(){
					if ( new Date().getTime() - me.lastCallTime < me.interval ){
						return this.returnLast === true ? this.lastResult : false;
					}
					me.lastCallTime = new Date().getTime();
					this.lastResult = me.originalFn.apply(
						originalFnScope,
						Array.prototype.concat.call(Array.prototype.slice.call(arguments), callArgs)
					);
					return this.lastResult;
				};
			},
			/**
			 * replacing logic:
			 * 1) trim
			 * 2) replace any number of continous spaces with one dot
			 * 3) replace first symbol with dot plus that first symbol
			 * @param {type} str
			 * @returns {String}
			 */
			classStringToSelector: function(str){
				str = str || '';
				return str.trim().replace(/\s+/gim,'.').replace(/^(.)/gim, '.$1' );
			},
			/**
			 *
			 * @param forcedTpl
			 * @param forcedData
			 * @param {Object} [opts]
			 * @param {Boolean} [opts.safe] Slicer.avoidHtml will be applied
			 * @returns {string|*|String}
			 */
			processTpl: function(forcedTpl, forcedData, opts){
				var tplToProcess = forcedTpl || this.getTpl() || this.tpl || '',
					processedTpl = '',
					rex,
					i;

				this.data = this.data || {};
				this.cfg = this.cfg || {};
				opts = opts || {};

				if (!forcedTpl){
					this.tpl = tplToProcess || this.tpl;
				}
				/**
				 * 1) [\\[<]% -> "[%" or "<%"
				 * 2) \\s*\\w+\\s*% -> NONE or MORE whitespace(s), then words, then NONE or MORE whitespace(s)
				 * 3) %[\\]>] -> "%]" or "%>"
				 * 4) OR (may be optimized)
				 * 5) [\\[<]% -> "[%" or "<%"
				 * <%cat%> -> [% cat%] -> [% cat %] -> <%     cat%] => "cat"
				 */
				rex = new RegExp('[\\[<]%\\s*\\w+\\s*%[\\]>]', 'gm');
				// conditional one single replace
				if ( opts.once ){
					processedTpl = tplToProcess.replace( rex, U._replacerFn.bind(this, forcedData, opts) );
				}else{
					i = 0;
					processedTpl = tplToProcess;
					// default recursive replace: it is possible to have property test = '[%subtest%]'
					// and property subtest = 'result';
					// Result of this.processTpl('[%test%]') will be 'result'
					while ( !!processedTpl.match(rex) && i < 10000000 ){
						i++;
						processedTpl = processedTpl.replace( rex, U._replacerFn.bind(this, forcedData, opts) );
					}
				}

				// || is for case, when there's no items in this.data
				return processedTpl || this.tpl;
			},
			/**
			 * @private
			 * @param {String} found
			 * @return {String}
			 */
			_replacerFn: function(forcedData, opts, found){
				opts = opts || {};
				found = found.replace(/[\[\]%\s<>]/gim, '');
				// returns cfg value from component's object or component's 'data'
				// property or empty string
				var parentData = U.isDefined(forcedData) ? forcedData : this;
				parentData.data = parentData.data || {};
				parentData.cfg = parentData.cfg || {};
				var result = typeof parentData[found] !== 'undefined'
					? parentData[found] : typeof parentData.data[found] !=='undefined'
						? parentData.data[found] : typeof parentData.cfg[found] !=='undefined' ?
						parentData.cfg[found] : '';
				return opts.safe ? Slicer.avoidHtml(result) : result; // TODO: it is bad, we should not use Slicer's methods from core!
			},
			/**
			* Clone date, array and object without keeping reference.
			* @param {Object} item The variable to clone
			* @return {Object} clone
			*/
			clone: function(item) {
				var type, i, j, k, clone, key;
				if (item === null || item === undefined) {
					return item;
				}
				if (item.nodeType && item.cloneNode) {
					throw 'Type mismatch, input item should be a direct decendant of Object';
				}
				type = Object.prototype.toString.call(item);
				if (type === '[object Date]') {
					return new Date(item.getTime());
				}
				if (type === '[object Array]') {
					i = item.length;
					clone = [];
					while (i--) {
						clone[i] = U.clone(item[i]);
					}
				}else if (type === '[object Object]' && item.constructor === Object) {
					clone = {};
					for (key in item) {
						clone[key] = U.clone(item[key]);
					}
					if (U.enumerables) {
						for (j = U.enumerables.length; j--;) {
							k = U.enumerables[j];
							clone[k] = item[k];
						}
					}
				}
				return clone || item;
			},
			/**
			 * Groups all usages of prop in one place.
			 * @param {jQuery} $checkbox
			 * @returns {undefined}
			 */
			checkBox: function($checkbox){
				if ( !$checkbox ){ return; }
				$checkbox.prop('checked', true);
			},
			/**
			 * Groups all usages of prop in one place.
			 * @param {jQuery} $checkbox
			 * @returns {undefined}
			 */
			uncheckBox: function($checkbox){
				if ( !$checkbox ){ return; }
				$checkbox.prop('checked', false);
			},
			/**
			 * Returns last element of an array
			 * @param {Array} arr <b>Array type, please!</b>
			 * @returns {Mixed}
			 * TODO test
			 */
			last: function(arr){
				if ( !$.isArray(arr) ){ throw 'Type mismatch. Argument must by array type.'; }
				arr = arr || [];
				return arr[arr.length - 1];
			},
			/**
			 * Returns first element of an array
			 * @param {Array} arr <b>Array type, please!</b>
			 * @returns {Mixed}
			 * TODO test
			 */
			first: function(arr){
				if ( !$.isArray(arr) ){ throw 'Type mismatch. Argument must by array type.'; }
				arr = arr || [];
				return arr[0];
			}
		});
		// alias
		U.df = U.deepestFirst;
		U.dfs = U.deepestFirstBatch;
		U.cc = U.createComponent;
		U.c2s = U.classStringToSelector;
	})();

	/**
	 * @class U.util
	 * @singleton
	 */
	(function(){
		U.util = U.util || {};

		U.apply(U.util, {
			/**
			 * @param {Mixed} value
			 * @param {String} [type]
			 * @param {Number} [precision]
			 * @param {Boolean} [asString] Truo to not parse result to number. Allows to return 0.00 (for example)
			 * @returns {Mixed}
			 */
			value: function(value, type, precision, asString) {
				// '_' prefix for processors methods distinguish them from 'normal' ones
				// as these are very special for slicer.
				type += '';
				type = type || 'generic';
				var fractionSize;
				fractionSize = U.isDefined(precision) ? parseInt(precision, 10) : 2;
				if ( U.util.__cache__.processors[type] ) {
					return U.util.__cache__.processors[type].call(this, value, fractionSize, !!asString);
				}
				return value;
			},
			/**
			 * Must convert big (not so big) or small (not so small) numbers into strings.
			 * There's no native methods to do so for numbers like 0.000000000001
			 * Taken from SOF, modified to pass tests
			 * @param {Number} x
			 * @returns {String|Mixed} if no .toString, x is returned as is
			 */
			numberToString: function(x) {
				if ( typeof x === 'undefined' || x === null || !x.toString ){
					return x;
				}
				if (Math.abs(x) < 1.0) {
					var e = parseInt(x.toString().split('e-')[1]);
					if (e) {
						x *= Math.pow(10,e-1);
						x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
					}
				} else {
					var e = parseInt(x.toString().split('+')[1]);
					if (e > 20) {
						e -= 20;
						x /= Math.pow(10,e);
						x += (new Array(e+1)).join('0');
					}
				}
				return x + '';
			},
			/**
			 *
			 * @param {Mixed} value
			 * @param {Number} roundTo
			 * @private
			 * @returns {Number}
			 */
			_floatValue: function(value, roundTo, asString) {
				var resultStr = value.toFixed(roundTo);
				return asString ? resultStr : parseFloat( resultStr );
			},
			/**
			 *
			 * @param {Mixed} value
			 * @param {Boolean} x100
			 * @param {Number} roundTo
			 * @private
			 * @returns {Number}
			 */
			_percentValue100: function(value, roundTo, asString) {
				var resultStr = (value * 100).toFixed(U.isDefined(roundTo) ? roundTo : 0);
				return asString ? resultStr : parseFloat( resultStr );
			}
		});
		U.apply(U.util, {
			__cache__: {
				formatters:{},
				processors:{
					float: U.util._floatValue,
					percent: U.util._percentValue100,
					int: function(value) {return parseInt(value, 10);},
					generic: function(value) {return value;}
				}
			}
		});
	})();

	// dom manip
	(function(){
		U.dom = U.dom || {};

		U.apply(U.dom, {
			btnSelector: '[data-type="btn"]',
			/**
			 * Generates and returns button selector combined with given action.
			 * Basically it will be [data-type=btn][data-action="{{action}}"]
			 * @param {String} action
			 * @returns {String}
			 */
			getBtnActionSelector: function(action){
				return '{0}[data-action{1}]'.format(U.dom.btnSelector, action ? ('="' + action + '"') : '');
			}
		});
	})();

	(function(){
		/**
		* Handles defining classes for our application.
		* Based on PrototypeJS. Not compatible with original PrototypeJS, because
		* changed a lot.
		*
		* Read this manual:
		* <a href="http://prototypejs.org/learn/class-inheritance">http://prototypejs.org/learn/class-inheritance</a>
		*
		* Explanation for className and utype configs.
		*
		*		U.define(ParentClass,{
		*			className: 'superAwesomeClass',
		*			utype: 's-klasse',
		*
		*			configForNewClass: 'someConfig',
		*
		*			initComponent: function($super, config){
		*				U.apply(this, config);
		*			},
		*
		*			newMethod: function(){
		*				alert('Hello');
		*			},
		*
		*			inheritedMethod: function($super){
		*				$super.call(this);
		*				//do something else
		*			}
		*		});
		*
		* @class U.ClassManager
		* @singleton
		 */
		U.ClassManager = ClassManager

		/**
		 * @class U
		 */

		/**
		 * @method define
		 * alias for {@link U.ClassManager#define}
		 */
		U.define = U.ClassManager.define;
	})();

	(function(){
		'use strict';
		U.idSeed = 0;
		/**
		 * ID generation (based on inc)
		 * @param {String|Boolean|undefined} [template] String may be sent and used inside generated response
		 * @returns {String}
		 */
		U.id = function(template){
			return (template ? template : 'u-id-gen-') + (++U.idSeed);
		};
	})();


	U.coreReady = true;
	//global.U = U; // is failing when testing :(
    window.U = U;
}).call(global, ClassManager),
Templator = (function (){
	// EXPERIMENTAL STUFF, consider it just for fun.
	U.define({
		className: 'Templator',
		singleton: true,
		initComponent: function(config){
			U.apply(this, config);
			this.setShorthands();
			U.Tpl = this;
		},
		/**
		 *
		 * @param tagName
		 * @param cfg
		 * @param specialOptions
		 * @param {Object} templateData Additional templating data may be given. In case tag's content
		 * contains template strings -> they must be replaced here in processTpl run
		 * @returns {*|string|String}
		 */
		tag: function(tagName, cfg, specialOptions, templateData){
			specialOptions = specialOptions || {};
			var tpl = !specialOptions.isClosed ? '<[% tag %]{0}>[% content %]</[% tag %]>' : '<[% tag %]{0}[% content %]/>';
			var attrsTpl = [];
			if ( U.isString(cfg) ){
				cfg = {
					content: cfg
				};
			}
			cfg = cfg || {};
			U.applyIf(cfg, {
				attrs: {}
			});

			U.applyIf(cfg.attrs, {
				id: cfg.id,
				'class': cfg.cls
			});

			U.eachKey(cfg.attrs, function(attrName, attrValue){
				if ( U.areDefined(attrName, attrValue) ){
					attrsTpl.push( '{0}="{1}"'.format(attrName, attrValue) );
				}
			}, this);

			if ( attrsTpl.length > 0 ){
				tpl = tpl.format(' ' + attrsTpl.join(' ').trim());
			}else{
				tpl = tpl.format('');
			}

			return U.processTpl(
				tpl,
				U.applyIf({tag: tagName, content: cfg.content || ''}, templateData || {})
			);
		},
		setShorthands: function(){
			var tags = ['div', 'span', 'table', 'tr', 'td'];
			U.each(tags, function(tagName){
				this[tagName] = function(cfg, specialOptions, templateData){
					return this.tag(tagName, cfg, specialOptions, templateData);
				};
			}, this);
			this.img = function(cfg, specialOptions, templateData){
				// TODO: create special mechanism/method - anything to provide the ability
				// TODO deal between specialOptions and img tag
				// to transfer 'core' attributes not inside 'attrs' prop but in the 'root' of 'cfg'
				// argument. Case is using .img method, there's a willing to call it .img({src: 'URL'})
				cfg = cfg || {};
				cfg.attrs = cfg.attrs || {};
				if (cfg.src){
					cfg.attrs.src = cfg.src;
				}
				return this.tag('img', cfg, {isClosed: true}, templateData);
			};
		},
		btn: function(cfg){
			cfg = cfg || {};
			var attrs = {
				'data-type': 'btn',
				'data-action': cfg.action
			};
			U.applyIf(cfg, {
				attrs: {}
			});
			U.apply(cfg.attrs, {
				'data-type': 'btn'
			});
			U.applyIf(cfg.attrs, {
				'data-action': cfg.action || cfg.attrs.action
			});

			return this.tag(cfg.tagName || 'a', cfg);
		}
	});

}).call(global),
U_util_Date = (function (){
    /* istanbul ignore if */
    if (!U){ return; } // that is not good, TODO: maybe exception
    /* istanbul ignore next */
    U.util = U.util || {};
    U.util.Date = {};
    var me = U.util.Date;

    /**
     *
     * @param {String|Date|Number} date Date and Number type input will be parsed to date with new Date()
     * @param {String} format available: e,d - day, m - month, Y,y - year FOUR DIGITS! P,p - hour in am/pm, H,I,k,l - hour in 24h, M - minutes
     * @param {Boolean} allowToday - Set to true to use today data for date parsing, otherwise,
     * not given pieces of data will be used as default: January 1st, 1970  00h 00m etc
     * @return {Boolean/Date} false for failed parse, date for success
     */
    me.parseDate = function (date, format, allowToday) {
        allowToday = !!allowToday;
        if ( !U.isDefined(date) ) { return false; }
		if ( date.constructor === Date || U.isNumber(date) ) {
			return new Date(date);
		}
        if ( !U.isDefined(format) ) { return false; }
		var parts, against, timestamp, i, d, m, y, h, min, now;
        if ( !U.isString(date) || !U.isString(format) ){ return false; }

		parts = date.split(/\W+/);
		against = format.split(/\W+/);
        now = new Date();

		for (i = 0; i < parts.length; i++) {
			switch (against[i]) {
				case 'd':
				case 'e':
					d = parseInt(parts[i],10);
					break;
				case 'm':
					m = parseInt(parts[i], 10)-1;
					break;
                case 'y':
				case 'Y':
                    y = parseInt(parts[i], 10);
					break;
				case 'H':
				case 'I':
				case 'k':
				case 'l':
					h = parseInt(parts[i], 10);
					break;
				case 'P':
				case 'p':
                    h = parseInt(parts[i], 10);
					if (/pm/i.test(parts[i]) && h < 12) {
						h += 12;
					} else if (/am/i.test(parts[i]) && h >= 12) {
						h -= 12;
					}
					break;
				case 'M':
					min = parseInt(parts[i], 10);
					break;
			}
		}
		var timestamp = Date.UTC(
			y === undefined ? allowToday ? now.getUTCFullYear() : 1970 : y,
			m === undefined ? allowToday ? now.getUTCMonth() : 0 : m,
			d === undefined ? allowToday ? now.getUTCDate() : 1 : d,
			h === undefined ? 0 : h,
			min === undefined ? 0 : min,
			0
		);
		return new Date(timestamp);
	};
    /**
     * Gets date object and returns string representing that date
     * @param {Date} date
     * @param {String} format
     * - a - short day name (Fri)
     * - A - full day name (Friday)
     * - b - short month name (Jul)
     * - B - full month name (July)
     * - C - century
     * - y - year ##
     * - Y - year ####
     * - m - month in ##
     * - d - day in ## (two digits)
     * - e - day as is (2014-Jul-1)
     * - H - hour in 24 and ##
     * - I - hour in AM/PM and ##
     * - j - day of the year in ###
     * - k - hour 24 as is #
     * - l - hour am/pm as is
     * - M - minutes in ##
     * - S - seconds in ##
     * - p,P - PM or AM
     * - s - timestamp in seconds
     * - u - day number (in week). Starting from 1 - Sunday to 7 - Saturday
     * - w - day number (in week). Starting from 0 - Sunday to 6 - Saturday
     *
     * @return {String|Boolean} returns false if something has failed
     */
    me.formatDate = function(date, format) {
        if ( !U.areDefined(date, format) ||  !U.isDate(date) || !U.isString(format) ){ return false; }
        if ( isNaN( date.getTime() ) ) {
            throw 'Invalid date supplied';
        }
		var m = date.getUTCMonth();
		var d = date.getUTCDate();
		var y = date.getUTCFullYear();
		var w = date.getUTCDay();
		var s = {};
		var hr = date.getUTCHours();
		var pm = (hr >= 12);
		var ir = (pm) ? (hr - 12) : hr;
		var dy = date.getDayOfYear();
		if (ir === 0) {
			ir = 12;
		}
		var min = date.getUTCMinutes();
		var sec = date.getUTCSeconds();
		var parts = format.split(''), part;
		for ( var i = 0; i < parts.length; i++ ) {
			part = parts[i];
			switch (parts[i]) {
				case 'a':
					part = date.getDayName();
					break;
				case 'A':
					part = date.getDayName(true);
					break;
				case 'b':
					part = date.getMonthName();
					break;
				case 'B':
					part = date.getMonthName(true);
					break;
				case 'C':
					part = 1 + Math.floor(y / 100);
					break;
				case 'd':
					part = (d < 10) ? ("0" + d) : d;
					break;
				case 'e':
					part = d;
					break;
				case 'H':
					part = (hr < 10) ? ("0" + hr) : hr;
					break;
				case 'I':
					part = (ir < 10) ? ("0" + ir) : ir;
					break;
				case 'j':
					part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
					break;
				case 'k':
					part = hr;
					break;
				case 'l':
					part = ir;
					break;
				case 'm':
					part = (m < 9) ? ("0" + (1+m)) : (1+m);
					break;
				case 'M':
					part = (min < 10) ? ("0" + min) : min;
					break;
				case 'p':
				case 'P':
					part = pm ? "PM" : "AM";
					break;
				case 's':
					part = Math.floor(date.getTime() / 1000);
					break;
				case 'S':
					part = (sec < 10) ? ("0" + sec) : sec;
					break;
				case 'u':
					part = w + 1;
					break;
				case 'w':
					part = w;
					break;
				case 'y':
					part = ('' + y).substr(2, 2);
					break;
				case 'Y':
					part = y;
					break;
			}
			parts[i] = part;
		}
		return parts.join('');
	};
}).call(global),
uFrameworkBuilder = (function (
	U_Core,
	Templator,
    U_util_Date
){
}).call(global, U_Core, Templator, U_util_Date);
})(this);