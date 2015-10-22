/**
 * Intersectable JavaScript Module v1.1
 * http://www.intheloftstudios.com/packages/js/intersectable
 *
 * Plugin to detect when an element scrolls past a portion of the visible screen.
 *
 * Copyright 2015, Aaron Klump <sourcecode@intheloftstudios.com>
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Thu Oct 22 10:20:27 PDT 2015
 */
/**
 * At the heart of this module is the concept of a bounds array.  It looks like
 * this: 
 *
 * [100, 300]
 *
 * It represents the vertical offset from the top of the document for the top of
 * the element and the bottom of the element, where the height is the difference.
 * It is the basis on which many of the methods operate.  You get the bounds of
 * a single element like this:
 * @code
 *   var i = new Intersectable();
 *   var bounds = i.getElementBounds($('#my-div'));
 * @endcode
 *
 * To see when an element is scrolled past the center 10% of the visible window:
 * @code
 *   // Define the center of the screen to be 5% on either side of dead center.
 *   var centerOfScreen = i.getWindowCenterBounds('10%', 'center');
 *   $(window).bind('scroll', function (e) {
 *
 *     // Convert the center of the screen to it's absolute position
 *     // relative to the top of the document.
 *     var absoluteCenter = i.toAbsoluteBounds(centerOfScreen);
 *
 *     // This is absolute by nature.
 *     var $el            = $('#my-div')
 *     var itemPos        = i.getElementBounds($el);
 *     var isInFocus      = i.intersection(itemPos, absoluteCenter);
 *
 *     if (isInFocus === 0) {
 *       $el.addClass('in-focus');
 *     }
 *     else {
 *       $el.removeClass('in-focus');
 *     }
 *   }
 * @endcode
 * 
 * Available in the global scope as:
 * @code
 *   var intersectable = new Intersectable();
 * @endcode
 */
var Intersectable = (function ($) {

  function Intersectable (settings) {
    this.version = "1.1";

    if (typeof settings === 'string') {
      settings = {key: settings};
    }
    this.settings = $.extend({}, this.options, settings); 

    this.items          = {};
    this.items.window   = [0, $(window).height()];
    this.items.document = [0, $(document).height()];

  }

  /**
   * Default options definition.
   *
   * Extend globally like this:
   * @code
   *   $.extend(Intersectable.prototype.options, {
   *     key: 'overridden'
   *   });
   * @endcode
   */
  Intersectable.prototype.options = {
    cssPrefix: 'intersectable__'
  };

  Intersectable.prototype.overlaps = function (item, item2) {
    return this.intersection(item, item2) === 0;
  };
  
  /**
   * Determine the intersection of an item to a region.
   *
   * @param  {array} item
   * @param  {array} region
   *
   * @return {int}
   *   -1 item is below region
   *   0 item intersects with the region
   *   1 item is above region
   */
  Intersectable.prototype.intersection = function (item, region) {
    if (region[0] > item[1]) {
      // item is above the region.
      return -1;
    }
    else if (region[1] < item[0]) {
      return 1;
    }
    // item is in the region.
    return 0;
  };

  /**
   * Return an element's absolute bounds array.
   *
   * @param  {HTMLElementObject|jQuery} element
   *
   * @return {Array}
   */
  Intersectable.prototype.getElementBounds = function (element) {
    $element = element instanceof jQuery ? element : $(element);
    
    return [$element.offset().top, $element.offset().top + $element.height()];
  };

  /**
   * Convert a bounds array to absolute values.
   *
   * If you want to define a region that occupies the 100px to 300px in the
   * visible window you would define it first as [100, 300] and then you 
   * would pass it to this function to get the absolute values, which are
   * used in intersection methods.
   *
   * @param  {array} item
   *
   * @return {array}
   */
  Intersectable.prototype.toAbsoluteBounds = function (item) {
    return this.addOffset(item, $(window).scrollTop());
  };

  /**
   * Returns a bounds array based on a single point.
   *
   * @param  {int} point A single value along the axis.
   * @param  {int} height The height in pixels of the bounds array.
   * @param  {string} align One of: top, center or bottom.  Defines where the
   *   bounds array is situated in relation to the point.  'top' means the
   *   top of the box sits at the point and extends below it fully.
   *
   * @return {array}
   */
  Intersectable.prototype.getBoundsFromPoint = function (point, height, align) {
    switch (align) {
      case 'bottom':
        return [point - height, point];
      case 'top':
        return [point, point + height];
      default:
        return [point - height / 2, point + height / 2];
    }
  };

  /**
   * Returns a bounds array based on the center of the window.
   * 
   * You may ask for a bounds by percentage or by absolute pixels as well as
   * defined the alignment against the center of the visible window.
   * 
   * @param string|int height The height of the bounds array.
   *   - string e.g. '10%'
   *   - int e.g. 150, which is taken as pixels.
   * @param string align
   * 
   * @see getBoundsFromPoint
   */
  Intersectable.prototype.getWindowCenterBounds = function (height, align) {
    
    // Convert from a percentage.
    if (typeof height === 'string' && height.slice(-1) === '%') {
      height = this.getHeight(this.items.window) * parseInt(height, 10) / 100;
    }

    var center        = this.getCenter(this.items.window);
    var inFocusBounds = this.getBoundsFromPoint(center, height, align);
    
    return inFocusBounds;
  };

  //
  //
  // HELPER METHODS
  //
  
  /**
   * Returns the height of a bounds array.
   *
   * @param  {array} item
   *
   * @return {int}
   */
  Intersectable.prototype.getHeight = function (item) {
    return item[1] - item[0];
  };

  /**
   * Returns the center point of an item, which is half the height of the item
   * plus it's lowest edge.
   *
   * @param  {array} item
   *
   * @return {int}
   */
  Intersectable.prototype.getCenter = function (item) {
    return this.getHeight(item) / 2 + item[0];
  };  

  /**
   * Adds an offset to an item either positive or negative.
   *
   * @param {array} item 
   * @param {int} amount
   */
  Intersectable.prototype.addOffset = function(item, amount) {
    return [item[0] + amount, item[1] + amount];
  };

  //
  //
  // OUTPUT FUNCTIONS
  //
  //

  /**
   * Adds the correct css prefix for classes and ids based on settings.
   *
   * @param  {string} string
   *
   * @return {string}
   */
  Intersectable.prototype.pre = function (string) {
    return this.settings.cssPrefix + string;
  };

  /**
   * Inserts a div in the DOM representing a bounds item.
   *
   * @param  {item} item
   * @param  {uuid} uuid string
   * @param  {array} classesArray
   *
   * @return {object} The HTML element.
   */
  Intersectable.prototype.showBounds = function (item, uuid, classesArray) {
    if (uuid === '') {
      throw "Invalid Argument: uuid cannot be empty.";
    }

    if (typeof classesArray === 'string') {
      classesArray = classesArray.split(' ');
    }

    classesArray = classesArray || [];
    if (classesArray.constructor !== Array) {
      throw "Invalid Argument: classesArray must be an array.";
    }
    uuid = this.pre(uuid);
    
    classesArray.unshift(this.pre('bounds'));

    // Retrieve by id or create if not already done so.
    var $bounds = $('#' + uuid);
    if ($bounds.length === 0) {
      $bounds = $('<div id="' + uuid + '" class="' + classesArray.join(' ') + '"></div>');
      $('body').append($bounds);
    }
    var style = {
      top: item[0],
      height: this.getHeight(item),
    };

    $bounds.css(style);
    $('body').addClass('intersectable');

    return $bounds.get(0);
  };  

  return  Intersectable;
})(jQuery);
