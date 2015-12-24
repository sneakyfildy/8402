define([],function() {
	'use strict';
	/**
	 * @class AbstractComponent
	 * @abstract
	 * Basic abstract component. Every other application components must be extended
	 * from this abstract one
	 */
	U.define({
		/**
		 * @property {String}
		 * @readonly
		 */
		className: 'AbstractAngularComponent',
		/**
		 * @cfg {String}
		 * CSS class to be added to 'selected' item(s)
		 */
		selectedItemCls: 'selected',
		/**
		 * Postfix of component's container element
		 */
		containerPostFix: '-container',
		/**
		 * @cfg {String}
		 * Defines if component will immidiately try to render itself after
		 * initialization
		 */
		autoRender: true,
		/**
		 * Important stuff, if set to true, this.$el will be the element WHERE this component's element is rendering into
		 * so, if true, then this.$el equals renderTo, if false - this.$el will point on what was rendered
		 * @config {Boolean}
		 */
		renderToParent: false,
		/**
		 * Set config to true, to overwrite on render
		 * @config {Boolean}
		 */
		renderAppend: false,
		bubbleButtonEvent: true,
		initComponent: function(config){
			U.apply(this, config);

			if (this.autoRender === true){
				this.render();
			}
		},

		/**
		 * Render component again, removing its $el.
		 * @chainable
		 * @returns {AbstractComponent}
		 */
		redoRender: function(){
			this.removeEl();
			return this.forceRender();
		},
		/**
		 * Forced rendering, does not remove $el, use with caution.
		 */
		forceRender: function(){
			this.rendered = false;
			this.rendering = false;
			return this.render();
		},

		/**
		 * Renders component's element to its selector.
		 * Launches onRender call when(if) finished.
		 * @chainable
		 * @returns {AbstractComponent}
		 */
		render : function(opts){
			opts = opts || {};
			//var start = new Date().getTime();
			var $renderToEl, renderToEl, tpl, temp, renderType;
			renderType = opts.forcedRenderType || this.renderType || 'append';
			if ( this.rendered || this.rendering ){
				return false;
			}

			if ( this.onBeforeRender() === false ){
				return this;
			}

			this.rendering = true;
			this.renderToSelector = U.isDefined(this.renderToId) ? ('#' + this.renderToId) : this.renderToSelector;
			$renderToEl = $(this.renderToSelector || this.renderToElement);

			if ( renderType === 'innerHTML' ){
				renderToEl = $renderToEl.get(0);
				if ( renderToEl ){
					tpl = this.processTpl();
					if ( renderToEl.tagName.toLowerCase() === 'tbody' ){
						// http://www.ericvasilik.com/2006/07/code-karma.html
						//$renderToEl.get(0).replaceChild();
						try {
							renderToEl.innerHTML = renderToEl.innerHTML || '';
							if (this.renderAppend) {
								renderToEl.innerHTML += tpl;
							} else {
								renderToEl.innerHTML = tpl;
							}
						}catch(e){
							// IE goes here
							/* istanbul ignore next */
							$renderToEl[this.renderAppend ? 'append' : 'html'](tpl); // all praise jQuery
						}
					}else{
						renderToEl.innerHTML = renderToEl.innerHTML || '';
						if (this.renderAppend) {
							renderToEl.innerHTML += tpl;
						} else {
							renderToEl.innerHTML = tpl;
						}
					}
				}
				this.$el = this.renderToParent ? $renderToEl : $renderToEl.children().first();
			}else{
				this.$el = $( this.processTpl() );
				if ( $renderToEl[renderType] && U.isFunction($renderToEl[renderType]) ){
					$renderToEl[renderType](this.$el);
				}else{
					throw 'Unknown render type';
				}
				this.$el = this.renderToParent ? $renderToEl : this.$el;
			}

			//this.className === 'Grid.Body' && console.log('render time (ms):', (new Date().getTime() - start));
			return this._finishRender();
		},
		/**
		 * postRender should do the same as original regular render method. The difference is
		 * that postRender is called on components, which already have their markup inside DOM.
		 * E.g. if somehow their markup was rendered without call to regular 'render'.
		 * It occurs in using panels with 'inline' rendering of their items - when panel renders
		 * with items' markup inside.
		 * <b>Assignment of a data-uid IS REQUIRED!!!</b>
		 * @chainable
		 * @returns {AbstractComponent}
		 */
		postRender : function(){
			this.$el = this.findEl();
			return this._finishRender();
		},
		/**
		 *
		 * @private
		 */
		_finishRender: function(){
			this.rendering = false;
			this.rendered = true;
			this.onRender && this.onRender();
			this.visible = this.$el.css('visibility') !== 'hidden' && this.$el.css('display') !== 'none'; // inspect if it is iron
			return this;
		},
		/**
		 * Basic template processing. Runs through component's data objects and replaces
		 * matched templete elements.
		 * To declare element in template use [%elementName%]
		 * @param {String} forcedTpl Send sting to receive it processed
		 * @returns {String} processed template string
		 */
		processTpl: function(forcedTpl, forcedData){
			return U.processTpl.apply(this, arguments);
		},
		/**
		 * Sets the visibility of its $el
		 * @param {boolean} state required visibility state
		 * @returns {boolean} operation success
		 */
		setVisible: function(state){
			if ( !this.$el || !this.rendered ){
				return false;
			}

			var currentState = this.$el.css('visibility') === 'visible' ? true : false;

			// set visibility only if states are different to decrease reflows or component status
			// is incorrect
			if ( state !== currentState || this.visible !== currentState ){
				this.$el.css({
					'visibility' : state ? 'visible' : 'hidden'
				});

				this.visible = state;
			}

			return true;
		},
		/**
		 * Sets the display state of its $el
		 * @param {Boolean} state required display state
		 * @param {Number} duration ms
		 * @returns {boolean} operation success
		 */
		setDisplayed: function(state, duration){
			if ( !this.$el || !this.rendered ){
				return false;
			}
			this[state ? 'show' : 'hide'](duration);
			return true;
		},

		/**
		 * Hides component's element with jQuery method 'hide'
		 * @param {Number} duration ms
		 */
		hide: function(duration){
			duration = duration || 0;
			if ( duration === 0 ){
				this.$el.hide();
			}else{
				this.$el.fadeOut(duration);
			}
			this.visible = false;
			this.onHide();
		},

		/**
		 * Shows component's element with jQuery method 'show'
		 * @param {Number} duration ms
		 */
		show: function(duration){
			this.onBeforeShow();
			duration = duration || 0;
			if ( duration === 0 ){
				this.$el.show();
			}else{
				this.$el.fadeIn(duration);
			}
			this.visible = true;
			this.onShow();
		},
		onBeforeShow: U.emptyFn,
		/**
		 * Removes component's element with jQuery method 'remove'
		 * @returns {undefined}
		 */
		removeEl: function(){
			if ( this.renderToParent ){
				// as we may have this.$el being equal to renderTo, then we cannot remove
				// it, because component may want to render again into that renderTo
				this.$el && this.$el.empty();
				return this;
			}
			this.$el && this.$el.remove();
            delete this.$el;
			return this;
		},
		/**
		 * Abstract getTpl function. Generates component's tpl. Is used by
		 * reneder method if return anything. If not, tpl property is used.
		 * @method getTpl
		 */
		getTpl: U.emptyFn,
		/**
		 * @event
		 * Triggered after rendering is finished, invokes elements linking,
		 * registering buttons handlers and event listeners setting.
		 */
		onRender: function(){
			this.linkElements();
			this.registerButtonHandlers();
			this.setListeners();
		},
		/**
		 * Generic action button listener
		 * Reads data-action; Adds 'BtnHandler' string;
		 * This will be the name of invoked component's method;
		 * @param {Event} e
		 * @return {Mixed|Boolean} result of handler call, false if no such handler
		 * (handler also may return false.
		 */
		onActionBtn: function(e){
			var $btn, action, registeredMethod, notRegisteredMethod;
			$btn = $(e.currentTarget);
			action = $btn.attr('data-action');
			registeredMethod = this.btnHandlers[ action ];
			notRegisteredMethod = this[action + 'BtnHandler'];

			if (
				!action || ( !$.isFunction( registeredMethod )
				&& !$.isFunction( notRegisteredMethod ) )
			){
				return !!this.bubbleButtonEvent;
			}

			if ( $.isFunction( registeredMethod ) ){
				return registeredMethod.call(this, e);
			}else{
				window.__DEBUG__ === true &&
				console.log('Unregistered button handler, please rewrite, its use is deprecated.',
					'Handler: ' + action + 'BtnHandler',
					',action: ' + action
				);
				return notRegisteredMethod.call(this, e);
			}
		},
		update: U.emptyFn,
		setListeners: function(){
			this.$el.on(
				'click',
				U.dom.getBtnActionSelector(''),
				this.onActionBtn.bind(this)
			);
		},
		/**
		 * This method creates links between 'data-action' attribute values on button
		 * elements and related handlers.
		 * Developer should extend {@link AbstractComponent#getButtonHandlersConfig} method
		 * and make it return an object with such structure:
		 * {
		 *		dataActionValue: this.dataActionValueBtnHandler
		 * }
		 *
		 * dataActionValue shuould be equal to <i>&lt;div data-type="btn" data-action=<b>"dataActionValue"</b>&gt;Button&lt;/div&gt;</i>
		 * 'data-action' attribute.
		 * Example:
		 *
		 *		@example
		 *		getButtonHandlersConfig: function(){
		 *			var cfg = {
		 *				sortColumn: this.sortColumnBtnHandler,
		 *				loadOthers: this.doLoadOthers
		 *			};
		 *			return cfg;
		 *		}
		 *
		 * {@link Grid#getButtonHandlersConfig}
		 *
		 * <b>PLEASE NOTE:</b>
		 * This makes possible to attach custom named methods as button handlers, in other
		 * words it is possible to use this.applySort handler on button with data-action="helloWorld"
		 * to do so just add "helloWorld: this.applySort" into "getButtonHandlersConfig" method
		 *
		 * <b>PLEASE NOTE (very important):</b>
		 * To keep backwards compatibility ability to run not registered handlers is left.
		 * This means that if you do not have link <b>'dataAction': this.handlerName</b>, but have
		 * <b>this.dataActionBtnHandler</b>, then <b>this.dataActionBtnHandler</b> will run.
		 * If application is in debug mode (defined by SHOW_PSERVICE_VERSION on startup), then
		 * console will log such run.
		 *
		 */
		registerButtonHandlers: function(){
			this.doRegisterButtonHandlers( this.getButtonHandlersConfig() );
		},
		doRegisterButtonHandlers: function(cfg){
			cfg = cfg || {};
			this.btnHandlers = cfg;
		},
		/**
		 * Performs lookup through component child elements to find a data-type=btn
		 * element with required data-action attribute
		 * @param {String} action
		 * @returns {jQuery}
		 */
		getBtn: function(action){
			if ( !U.isString(action) || action + '' === '' ){
				return U.getEmpty$();
			}
			return this.$el.find( U.dom.getBtnActionSelector(action) );
		},
		/**
		 * Buttons -> handlers configuration object
		 * Please read the doc {@link AbstractComponent#registerButtonHandlers}
		 * @method
		 */
		getButtonHandlersConfig: U.emptyFn,
		/**
		 * Links elements to this class's attributes
		 * @param {Function} $super Parent method
		 * @method
		 */
		linkElements: U.emptyFn,
		/**
		 * @event
		 * Triggered before rendering process is started.
		 * @returns {Boolean} return false to stop rendering.
		 */
		onBeforeRender: U.emptyFn,
		/**
		 * @event
		 */
		onShow: U.emptyFn,
		/**
		 * @event
		 */
		onHide: U.emptyFn,
		/**
		 * @event
		 * Triggers from inside show method, when element gains display: block;
		 */
		onHaveSizeBeforeShow: U.emptyFn,
		/**
		 * Looks for component's element inside DOM.
		 * <b>Assignment of a data-uid IS REQUIRED!!!</b>
		 * @param {jQuery} [$area] select area may be given
		 * @returns {*|jQuery}
		 */
		findEl: function($area){
			var selector = '[data-uid="{0}"]'.format(this.id);
			return $area ? $area.find(selector) : $(selector);
		},
		/**
		 * Generates value for 'data-uid' attr of components's container
		 * @param {uComponent} [itemComponent] may be given, otherwise 'this' will be used
		 * @returns {string}
		 */
		getContainerUid: function(component){
			return (component || this).id + this.containerPostFix;
		}
	});

});