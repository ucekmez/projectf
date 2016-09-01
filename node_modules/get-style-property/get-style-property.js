'use strict';
/*jshint browser: true */

/**
 * Gets the current value of a style property for a given DOM element.
 *
 * @function
 * @param el {Object} The DOM element.
 * @param propName {String} The name of the property.
 * @return {String} The current value of the element's style and given property. 
 */
module.exports = function(el, propName) {
  return el.currentStyle
    ? el.currentStyle[propName]
    : window.getComputedStyle
      ? document.defaultView.getComputedStyle(el, null).getPropertyValue(propName)
      : null;
};
