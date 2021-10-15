"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _utils = _interopRequireDefault(require("./utils"));

var _this = void 0;

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
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return promise;

          case 3:
            result = _context.sent;
            console.log(result);
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            console.warn('error', _context.t0);

          case 10:
            console.log('--- after promise ---');

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 7]]);
  }));
  return _fn.apply(this, arguments);
}

fn(); // 5.includes

var flag = [1, 2, 3].includes(1);
console.log('includes', flag);
exports.default = {
  name: 'yxp'
};