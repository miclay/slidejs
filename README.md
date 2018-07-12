# slidejs
SlideJS实现分屏滚动功能，不依赖任何第三方库

### How to use?

```
<script src="../lib/index.js"></script>
<script>
  var slider = new SlideJS({
    parentSelector: '.slid-box', // 父容器的selector
    itemSelector: '.slid-item', // 每一屏的selector，确保为parentSelector下的子元素
    width: 800, // 宽度，默认取值为window.innerWidth
    height: 500, // 高度，默认取值为window.innerHeight
    transitionDuration: 500, // 翻屏动画时间，单位毫秒ms，默认值为500
    transitionTimingFunction: 'ease', // 翻屏动画缓动函数，默认值为ease
    transitionDelay: 0, // 翻屏动画过渡效果延时，单位毫秒ms，默认值为0
    activeIndex: 0, // 当前展示第几屏，从0开始，默认值为0
    loop: false, // 是否循环翻屏，默认值为false
    beforeSlide: function(prevIndex, nextIndex) {
      // return 'stop';
    },
    afterSlide: function(prevIndex, nextIndex) {
      console.log(prevIndex, nextIndex);
    }
  });

  // 调用实例上的方法
  // slider.slidePrev(); // 翻到上一屏
  // slider.slideNext(); // 翻到下一屏
  // slider.slideTo(N); // 翻到第N屏，N从0开始计算
</script>
```
