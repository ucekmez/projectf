'use strict';
/*jshint browser: true */

var foo              =  document.querySelector('.foo')
  , getStyleProperty =  require('..');

function log(s) {
  foo.appendChild(document.createTextNode(s));
  foo.appendChild(document.createElement('br'));
}

log('My style properties');
log('-----------------------');
log('');

log('height: ' + getStyleProperty(foo, 'height'));
log('min-height: ' + getStyleProperty(foo, 'min-height'));
log('max-height: ' + getStyleProperty(foo, 'max-height'));
log('background: ' + getStyleProperty(foo, 'background'));
log('margin: ' + getStyleProperty(foo, 'margin'));
log('margin-left: ' + getStyleProperty(foo, 'margin-left'));
