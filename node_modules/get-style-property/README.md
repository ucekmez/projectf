# get-style-property

Gets the current value of a style property for a given DOM element.

[![browser support](https://ci.testling.com/thlorenz/get-StyleProperty.png)](https://ci.testling.com/thlorenz/get-StyleProperty)

```js
var foo              =  document.querySelector('.foo')
  , getStyleProperty =  require('get-style-property');

// assuming we applied css: ".foo { min-height: 20px }"

console.log(getStyleProperty(foo, 'min-height')); // => 20px
```

## API

```js
/**
 * Gets the current value of a style property for a given DOM element.
 *
 * @function
 * @param el {Object} The DOM element.
 * @param propName {String} The name of the property.
 * @return {String} The current value of the element's style and given property. 
 */
getStyleProperty(el, propName)
```
