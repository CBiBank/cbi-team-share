"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _utils = _interopRequireDefault(require("./utils"));

var _this = void 0,
    _context;

_utils.default.getName(); // import '@babel/polyfill'
// import 'core-js/stable'
// import 'regenerator-runtime/runtime'
// 1.arrow function


var arrowFun = function arrowFun() {
  console.log('arrow-function', _this);
}; // 2.class


var Person = /*#__PURE__*/function () {
  function Person(name) {
    (0, _classCallCheck2.default)(this, Person);
    this.name = name;
  }

  (0, _createClass2.default)(Person, [{
    key: "say",
    value: function say() {
      alert('hello');
    }
  }]);
  return Person;
}(); // 3.promise es6新增


var promise = new _promise.default(function (resolve, reject) {
  setTimeout(function () {
    if (Math.random() * 10 >= 5) {
      resolve('大于5');
    } else {
      reject('小于5');
    }
  }, 2000);
});
promise.then(function (res) {
  return console.log(res);
}); // 4.async await es7 需要polyfill 否则执行代码报错 regeneratorRuntime不存在

function fn() {
  return _fn.apply(this, arguments);
}

function _fn() {
  _fn = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee() {
    var result;
    return _regenerator.default.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return promise;

          case 3:
            result = _context2.sent;
            console.log(result);
            _context2.next = 10;
            break;

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            console.warn('error', _context2.t0);

          case 10:
            console.log('--- after promise ---');

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, null, [[0, 7]]);
  }));
  return _fn.apply(this, arguments);
}

fn(); // 5.includes

var flag = (0, _includes.default)(_context = [1, 2, 3]).call(_context, 1);
console.log('includes', flag);
exports.default = {
  name: 'yxp'
};