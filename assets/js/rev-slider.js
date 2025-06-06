// Revolution Slider
var RevSlider = (function () {
  "use strict";

  // Revolution Slider 1
  var handleRevSliderLayout1 = function () {
    var tpj = jQuery,
      revapi9;
    tpj(document).ready(function () {
      if (tpj("#rev-slider1").revolution == undefined) {
        revslider_showDoubleJqueryError("#rev-slider1");
      } else {
        revapi9 = tpj("#rev-slider1")
          .show()
          .revolution({
            sliderType: "standard",
            jsFileLocation: "includes/rev-slider/js/",
            sliderLayout: "fullwidth",
            dottedOverlay: "none",
            delay: 9000,
            navigation: {
              keyboardNavigation: "on",
              keyboard_direction: "horizontal",
              mouseScrollNavigation: "off",
              onHoverStop: "off",
              touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                drag_block_vertical: false,
                swipe_direction: "horizontal",
              },
              bullets: {
                enable: true,
                hide_onmobile: true,
                hide_under: 992,
                style: "zeus",
                hide_onleave: false,
                direction: "horizontal",
                h_align: "right",
                v_align: "bottom",
                h_offset: 80,
                v_offset: 50,
                space: 5,
                tmp: '<span class="tp-bullet-image"></span><span class="tp-bullet-imageoverlay"></span><span class="tp-bullet-title">{{title}}</span>',
              },
            },
            viewPort: {
              enable: true,
              outof: "pause",
              visible_area: "80%",
            },
            responsiveLevels: [1240, 1024, 778, 480],
            gridwidth: [1240, 1024, 778, 480],
            gridheight: [650, 450, 400, 350],
            lazyType: "smart",
            parallax: {
              type: "scroll",
              origo: "enterpoint",
              speed: 400,
              levels: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            },
            shadow: 0,
            spinner: "off",
            stopLoop: "off",
            stopAfterLoops: -1,
            stopAtSlide: -1,
            shuffle: "off",
            autoHeight: "off",
            fullScreenOffsetContainer: ".rev-slider-offset",
            hideThumbsOnMobile: "off",
            hideSliderAtLimit: 0,
            hideCaptionAtLimit: 0,
            hideAllCaptionAtLilmit: 0,
            debugMode: false,
            fallbacks: {
              simplifyAll: "off",
              nextSlideOnWindowFocus: "off",
              disableFocusListener: false,
            },
          });
      }
    });
  };

  // Revolution Slider 2
  var handleRevSliderLayout2 = function () {
    var tpj = jQuery,
      revapi9;
    tpj(document).ready(function () {
      if (tpj("#rev-slider2").revolution == undefined) {
        revslider_showDoubleJqueryError("#rev-slider2");
      } else {
        revapi9 = tpj("#rev-slider2")
          .show()
          .revolution({
            sliderType: "standard",
            jsFileLocation: "includes/rev-slider/js/",
            startwidth: 1170,
            startheight: 650,
            fullWidth: "on",
            dottedOverlay: "none",
            delay: 9000,
            navigation: {
              keyboardNavigation: "on",
              keyboard_direction: "horizontal",
              mouseScrollNavigation: "off",
              onHoverStop: "off",
              touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                drag_block_vertical: false,
                swipe_direction: "horizontal",
              },
              arrows: {
                style: "gyges",
                enable: true,
                hide_onmobile: true,
                hide_under: 768,
                hide_onleave: true,
                tmp: "",
                left: {
                  h_align: "left",
                  v_align: "center",
                  h_offset: 0,
                  v_offset: 0,
                },
                right: {
                  h_align: "right",
                  v_align: "center",
                  h_offset: 0,
                  v_offset: 0,
                },
              },
              bullets: {
                enable: false,
              },
            },
            viewPort: {
              enable: true,
              outof: "pause",
              visible_area: "80%",
            },
            responsiveLevels: [1240, 1024, 778, 480],
            gridwidth: [1240, 1024, 778, 480],
            gridheight: [500, 450, 400, 350],
            lazyType: "smart",
            parallax: {
              type: "scroll",
              origo: "enterpoint",
              speed: 400,
              levels: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            },
            shadow: 0,
            spinner: "off",
            stopLoop: "off",
            stopAfterLoops: -1,
            stopAtSlide: -1,
            shuffle: "off",
            autoHeight: "off",
            fullScreenOffsetContainer: ".rev-slider-offset",
            hideThumbsOnMobile: "off",
            hideSliderAtLimit: 0,
            hideCaptionAtLimit: 0,
            hideAllCaptionAtLilmit: 0,
            debugMode: false,
            fallbacks: {
              simplifyAll: "off",
              nextSlideOnWindowFocus: "off",
              disableFocusListener: false,
            },
          });
      }
    });
  };

  // Revolution Slider 3
  var handleRevSliderLayout3 = function () {
    var tpj = jQuery,
      revapi9;
    tpj(document).ready(function () {
      if (tpj("#rev-slider3").revolution == undefined) {
        revslider_showDoubleJqueryError("#rev-slider3");
      } else {
        revapi9 = tpj("#rev-slider3")
          .show()
          .revolution({
            sliderType: "standard",
            jsFileLocation: "includes/rev-slider/js/",
            startwidth: 1170,
            startheight: 710,
            fullWidth: "on",
            dottedOverlay: "none",
            delay: 6000,
            navigation: {
              keyboardNavigation: "on",
              keyboard_direction: "horizontal",
              mouseScrollNavigation: "off",
              onHoverStop: "off",
              touch: {
                touchenabled: "on",
                swipe_threshold: 75,
                swipe_min_touches: 1,
                drag_block_vertical: false,
                swipe_direction: "horizontal",
              },
              arrows: {
                style: "gyges",
                enable: true,
                hide_onmobile: true,
                hide_under: 768,
                hide_onleave: true,
                tmp: "",
                left: {
                  h_align: "left",
                  v_align: "center",
                  h_offset: 0,
                  v_offset: 0,
                },
                right: {
                  h_align: "right",
                  v_align: "center",
                  h_offset: 0,
                  v_offset: 0,
                },
              },
              bullets: {
                enable: false,
              },
            },
            viewPort: {
              enable: true,
              outof: "pause",
              visible_area: "80%",
            },
            responsiveLevels: [1240, 1024, 778, 480],
            gridwidth: [1240, 1024, 778, 480],
            gridheight: [700, 650, 600, 450],
            lazyType: "smart",
            parallax: {
              type: "scroll",
              origo: "enterpoint",
              speed: 400,
              levels: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            },
            shadow: 0,
            spinner: "off",
            stopLoop: "off",
            stopAfterLoops: -1,
            stopAtSlide: -1,
            shuffle: "off",
            autoHeight: "off",
            fullScreenOffsetContainer: ".rev-slider-offset",
            hideThumbsOnMobile: "off",
            hideSliderAtLimit: 0,
            hideCaptionAtLimit: 0,
            hideAllCaptionAtLilmit: 0,
            debugMode: false,
            fallbacks: {
              simplifyAll: "off",
              nextSlideOnWindowFocus: "off",
              disableFocusListener: false,
            },
          });
      }
    });
  };

  return {
    init: function () {
      handleRevSliderLayout1(); // initial setup for revolution slider layout 1
      handleRevSliderLayout2(); // initial setup for revolution slider layout 2
      handleRevSliderLayout3(); // initial setup for revolution slider layout 3
    },
  };
})();

$(document).ready(function () {
  RevSlider.init();
});
