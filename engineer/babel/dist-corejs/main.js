"use strict";

require("regenerator-runtime/runtime.js");

require("core-js/modules/es6.function.name.js");

require("core-js/modules/es6.object.to-string.js");

require("core-js/modules/es6.promise.js");

require("core-js/modules/es7.array.includes.js");

var _utils = _interopRequireDefault(require("./utils"));

var _this = void 0;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_utils.default.getName(); // import '@babel/polyfill'
// import 'core-js/stable'
// import 'regenerator-runtime/runtime'
// 1.arrow function


var arrowFun = function arrowFun() {
  console.log('arrow-function', _this);
}; // 2.class


var Person = /*#__PURE__*/function () {
  function Person(name) {
    _classCallCheck(this, Person);

    this.name = name;
  }

  _createClass(Person, [{
    key: "say",
    value: function say() {
      alert('hello');
    }
  }]);

  return Person;
}(); // 3.promise es6新增


var promise = new Promise(function (resolve, reject) {
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
  _fn = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
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