/**
 * @name SlideJS
 * @description SlideJS实现分屏滚动功能，不依赖任何第三方库
 * @author miclay
 */

!function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
}('SlideJS', this, function () {
  var lib = function(options) {
    this.opts = {
      parentSelector: '.slide-box', // 父容器的selector
      itemSelector: '.slide-item', // 每一屏的selector，确保为parentSelector下的子元素
      itemDocSelector: null, // 每一屏内容文档(自适应高度)的selector，非必填，默认为itemSelector的子元素
      width: null, // 宽度，默认取值为window.innerWidth
      height: null, // 高度，默认取值为window.innerHeight
      transitionDuration: 500, // 翻屏动画时间，单位毫秒ms，默认值为500
      transitionTimingFunction: 'ease', // 翻屏动画缓动函数，默认值为ease
      transitionDelay: 0, // 翻屏动画过渡效果延时，单位毫秒ms，默认值为0
      activeIndex: 0, // 当前展示第几屏，从0开始，默认值为0
      loop: false, // 是否循环翻屏，默认值为false
      scrollSensitivity: 300, // 滑屏敏感度，默认300ms
      beforeSlide: function() {},
      afterSlide: function() {},
    };
    options = options || {};
    for (var key in options) {
      this.opts[key] = options[key];
    }

    this.activeIndex = this.opts.activeIndex;
    this.sliding = false;
    this.contentScrolling = false;

    this._init();
  };
  
  lib.prototype = {
    _init: function() {
      var opts = this.opts;
      var domSlidBox = document.querySelector(opts.parentSelector);
      if (domSlidBox && domSlidBox.querySelectorAll) {
        this.domSlidBox = domSlidBox;
        this.domSlidItems = domSlidBox.querySelectorAll(opts.itemSelector);
      } else {
        throw Error('请传入正确的parentSelector参数(如:".slid-box")');
        return;
      }
      if (!this.domSlidItems || !this.domSlidItems.length) {
        throw Error('请传入正确的itemSelector参数(如:".slid-item")');
        return;
      }

      this.adapt();
      this._addEvents();
    },

    _addEvents: function() {
      var that = this;
      var opts = this.opts;
      var domSlidItems = this.domSlidItems;
      var scrollTimeout = -1;

      var eventResize = function() {
        var oriResize = window.onresize;
        if (oriResize && typeof oriResize === 'function') {
          window.onresize = function(e) {
            that.adapt();
          };
        } else {
          window.onresize = function(e) {
            that.adapt();
          };
        }
      };

      var isInnerContentScrolling = function(dirction) {
        var domItem = domSlidItems[that.activeIndex];
        var domItemFirstChild = domItem.children && domItem.children.length ? domItem.children[0] : null;
        var domItemContent = opts.itemDocSelector ? domItem.querySelector(opts.itemDocSelector) : domItemFirstChild;
        if (!domItemContent) {
          return false;
        }
        var innerHeight = opts.height || window.innerHeight;
        var contentHeight = domItemContent.clientHeight || 0;
        if (contentHeight - innerHeight <= 0) {
          return false;
        }
        var scrollTop = domItem.scrollTop || 0;
        // console.log('=====', dirction, scrollTop, contentHeight, innerHeight);
        if (dirction < 0) { // up
          if (scrollTop < contentHeight - innerHeight) {
            // console.log('stop by inner scroll up');
            return true;
          }
        } else if (dirction > 0) { // down
          if (scrollTop > 0) {
            // console.log('stop by inner scroll down');
            return true;
          }
        }
        return false;
      };

      var eventMouseWheel = function() {
        var mouseScrollHandler = function(e) {
          var wheelDelta = e.wheelDelta || -1 * e.detail;
          // console.log('++++', wheelDelta);
          if (isInnerContentScrolling(wheelDelta)) {
            return;
          }
          // console.log('++++', wheelDelta);
          if (wheelDelta < 0) {
            that.slideNext();
          } else if (wheelDelta > 0) {
            that.slidePrev();
          }
        };

        if (document.addEventListener) {
          document.addEventListener('DOMMouseScroll', mouseScrollHandler, false);
        }
        window.onmousewheel = document.onmousewheel = mouseScrollHandler;
        for (var i = 0; i < domSlidItems.length; i++) {
          (function() {
            var domItem = domSlidItems[i];
            var timeout = -1;
            domItem.onscroll = function(e) {
              that.contentScrolling = true;
              timeout = clearTimeout(timeout);
              timeout = setTimeout(function() {
                that.contentScrolling = false;
              }, that.opts.scrollSensitivity);
            };
          })();
        }
      };

      var eventTouch = function() {
        if (!('ontouchstart' in window)) {
          return;
        }
        var startY = -1;
        document.ontouchstart = function(e) {
          startY = e.touches[0].clientY;
        };
        document.ontouchmove = function(e) {
          var moveY = e.touches[0].clientY;
          var diff = moveY - startY;
          // console.log(diff, e);
          if (isInnerContentScrolling(diff)) {
            return;
          }
          if (diff < -10) {
            that.slideNext();
          } else if (diff > 10) {
            that.slidePrev();
          }
        };
        document.ontouchend = function(e) {
          startY = -1;
        };
      };

      eventResize();
      eventMouseWheel();
      eventTouch();
    },

    _anim: function(dom, index, activeIndex) {
      var opts = this.opts;
      var innerHeight = opts.height || window.innerHeight;
      if (index < activeIndex) {
        dom.style.top = -1 * innerHeight + 'px';
        dom.style.opacity = 0;
      } else if (index > activeIndex) {
        dom.style.top = innerHeight + 'px';
        dom.style.opacity = 0;
      } else {
        dom.style.top = 0;
        dom.style.opacity = 1;
        dom.scrollTop = 0;
      }
    },

    adapt: function() {
      var opts = this.opts;
      var domSlidBox = this.domSlidBox;
      var domSlidItems = this.domSlidItems;
      var innerWidth = opts.width || window.innerWidth;
      var innerHeight = opts.height || window.innerHeight;
      var transitionStyle = 'all ' 
        + opts.transitionDuration + 'ms ' 
        + opts.transitionTimingFunction + ' ' 
        + opts.transitionDelay + 'ms';
      domSlidBox.style.position = 'fixed';
      domSlidBox.style.width = innerWidth + 'px';
      domSlidBox.style.height = innerHeight + 'px';
      domSlidBox.style.left = 0;
      domSlidBox.style.top = 0;
      domSlidBox.style.overflow = 'hidden';
      for (var i = 0; i < domSlidItems.length; i++) {
        var domItem = domSlidItems[i];
        domItem.style.position = 'absolute';
        domItem.style.width = innerWidth + 'px';
        domItem.style.height = innerHeight + 'px';
        domItem.style.overflow = 'auto';
        this._anim(domItem, i, this.activeIndex);
        domItem.style['transition'] = transitionStyle;
        domItem.style['-ms-transition'] = transitionStyle;
        domItem.style['-webkit-transition'] = transitionStyle;
        domItem.style['-o-transition'] = transitionStyle;
        domItem.style['-moz-transition'] = transitionStyle;
      }
    },

    slideNext: function() {
      // console.log('***', this.sliding);
      if (this.sliding || this.contentScrolling) {
        return;
      }
      var that = this;
      var activeIndex = this.activeIndex;
      var domSlidItems = this.domSlidItems;
      var total = domSlidItems.length;
      var targetIndex = activeIndex + 1;
      if (targetIndex > total - 1) {
        if (this.loop) {
          targetIndex = 0;
        } else {
          return;
        }
      }
      // console.log('next');
      that.slideTo(targetIndex);
    },

    slidePrev: function() {
      if (this.sliding || this.contentScrolling) {
        return;
      }
      var that = this;
      var activeIndex = this.activeIndex;
      var domSlidItems = this.domSlidItems;
      var total = domSlidItems.length;
      var targetIndex = activeIndex - 1;
      if (targetIndex < 0) {
        if (this.loop) {
          targetIndex = total - 1;
        } else {
          return;
        }
      }
      // console.log('prev');
      that.slideTo(targetIndex);
    },

    slideTo: function(index) {
      var that = this;
      var opts = this.opts;
      var prevIndex = this.activeIndex;
      if (this.sliding || this.contentScrolling) {
        return;
      }
      if (opts.beforeSlide(prevIndex, index) === 'stop') {
        return;
      }
      this.sliding = true;
      setTimeout(function() {
        that.sliding = false;
        opts.afterSlide(prevIndex, index);
      }, opts.transitionDuration + 500);
      var domSlidItems = this.domSlidItems;
      // console.log('to: ', index);
      for (var i = 0; i < domSlidItems.length; i++) {
        var domItem = domSlidItems[i];
        this._anim(domItem, i, index);
      }
      
      this.activeIndex = index;
    }
  };

  return lib;
});