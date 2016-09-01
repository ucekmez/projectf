'use strict';
/*jshint asi: true, browser: true */

var test = require('tape')
  , getStyleProperty =  require('..');

+function setup() {

  +function createFoo() {
    var elem = document.createElement('div')
    elem.setAttribute('class', 'foo')
    elem.appendChild(document.createTextNode('some content for the get-style-property test'));
    document.body.appendChild(elem)
  }()

  +function loadStyle() {
    var css = [
          '.foo {'
        , '   min-height    :  40px;'
        , '   min-width     :  200px;'
        , '   padding       :  10px;'
        , '   margin        :  10px;'
        , '   background    :  antiquewhite;'
        , '   border        :  1px solid antiquewhite;'
        , '   border-radius :  5px;'
        , ' };'
    ].join('\n');

    var head  = document.getElementsByTagName('head')[0];
    var style = document.createElement('style');

    style.type = 'text/css';

    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
  }()
}()

test('get style property', function (t) {
  var foo = document.getElementsByClassName('foo')[0];
  
  t.ok(~['auto', '40px'].indexOf(getStyleProperty(foo ,  'height')), 'gets height')

  t.equal(getStyleProperty(foo ,  'min-height')          ,  '40px' ,  'gets min-height')
  t.equal(getStyleProperty(foo ,  'padding-left')        ,  '10px' ,  'gets padding-left')
  t.equal(getStyleProperty(foo ,  'padding-right')       ,  '10px' ,  'gets padding-right')
  t.equal(getStyleProperty(foo ,  'padding-top')         ,  '10px' ,  'gets padding-top')

  t.equal(getStyleProperty(foo ,  'margin-right')        ,  '10px' ,  'gets margin-right')
  t.equal(getStyleProperty(foo ,  'margin-left')         ,  '10px' ,  'gets margin-left')
  t.equal(getStyleProperty(foo ,  'margin-top')          ,  '10px' ,  'gets margin-top')

  // breaks in older firefox - prob. since this style property didn't exist then
  /*t.equal(getStyleProperty(foo ,  'border-bottom-left-radius')  ,  '5px'  ,  'gets border-radius-left')
  t.equal(getStyleProperty(foo ,  'border-bottom-right-radius') ,  '5px'  ,  'gets border-radius-right')
  t.equal(getStyleProperty(foo ,  'border-top-left-radius')     ,  '5px'  ,  'gets border-radius-top')*/

  t.end();
})
