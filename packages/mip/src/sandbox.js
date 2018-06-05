/**
 * @file sandbox.js 提供组件内部使用的沙盒环境，主要用于隔离全局环境和限制部分API能力
 * @author clark-t (clarktanglei@163.com)
 */

const WINDOW_ORIGINAL_KEYWORDS = [
  'Array',
  'ArrayBuffer',
  'Blob',
  'Boolean',
  'DOMError',
  'DOMException',
  'Date',
  'Error',
  'File',
  'FileList',
  'FileReader',
  'Float32Array',
  'Float64Array',
  'FormData',
  'Headers',
  'Image',
  'ImageBitmap',
  'Infinity',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'JSON',
  'Map',
  'Math',
  'MutationObserver',
  'NaN',
  'Notification',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'ReadableStream',
  'ReferenceError',
  'Reflect',
  'RegExp',
  'Request',
  'Response',
  'Set',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'URIError',
  'URL',
  'URLSearchParams',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'WritableStream',
  'addEventListener',
  'cancelAnimationFrame',
  'clearInterval',
  'clearTimeout',
  'console',
  'createImageBitmap',
  'decodeURI',
  'decodeURIComponent',
  'devicePixelRatio',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'fetch',
  'getComputedStyle',
  // 待定
  'history',
  'innerHeight',
  'innerWidth',
  'isFinite',
  'isNaN',
  'isSecureContext',
  'localStorage',
  // 待定
  'location',
  'length',
  'matchMedia',
  'navigator',
  'outerHeight',
  'outerWidth',
  'parseFloat',
  'parseInt',
  'removeEventListener',
  'requestAnimationFrame',
  'screen',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scroll',
  'scrollBy',
  'scrollTo',
  'scrollX',
  'scrollY',
  'scrollbars',
  'sessionStorage',
  'setInterval',
  'setTimeout',
  'undefined',
  'unescape',
  'webkitCancelAnimationFrame',
  'webkitRequestAnimationFrame'
]

const DOCUMENT_ORIGINAL_KEYWORDS = [
  'head',
  'body',
  'title',
  'cookie',
  'referrer',
  'readyState',
  'documentElement',
  'createElement',
  'createDcoumentFragment',
  'getElementById',
  'getElementsByClassName',
  'getElementsByTagName',
  'querySelector',
  'querySelectorAll'
]

function defs (obj, props, {original = window, writable = false} = {}) {
  Object.defineProperties(
    obj,
    props.reduce((obj, key) => {
      obj[key] = {
        enumberable: true,
        configurable: false
      }

      if (isFunc(original[key])) {
        let func = original[key].bind(original)

        let ownPropertyNames = Object.getOwnPropertyNames(original[key])
        defs(func, ownPropertyNames, {original: original[key]})

        obj[key].get = function () {
          return func
        }
      } else {
        obj[key].get = function () {
          return original[key]
        }

        obj[key].set = function (val) {
          if (writable) {
            original[key] = val
          }
        }
      }

      return obj
    }, {})
  )
}

function def (obj, prop, options) {
  let descriptor
  if (isFunc(options)) {
    descriptor = {
      enumberable: true,
      get: options
    }
  } else {
    descriptor = options
  }

  Object.defineProperty(obj, prop, descriptor)
}

/**
 * 是否为函数
 *
 * @param  {Function} fn 数据
 * @return {boolean}     是否为函数
 */
function isFunc (fn) {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

let sandbox = {}

defs(sandbox, WINDOW_ORIGINAL_KEYWORDS)

def(sandbox, 'window', function () {
  return sandbox
})

let sandboxDocument = {}

defs(sandboxDocument, DOCUMENT_ORIGINAL_KEYWORDS, {original: document, setter: true})

def(sandbox, 'document', function () {
  return sandboxDocument
})

def(sandbox, 'this', function () {
  return safeThis
})

function safeThis (that) {
  return that === window ? sandbox : that === document ? sandbox.document : that
}

export default sandbox
