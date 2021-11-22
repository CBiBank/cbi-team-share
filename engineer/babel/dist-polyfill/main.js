"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _utils = _interopRequireDefault(require("./utils"));

require("@babel/polyfill");

var _this = void 0;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_utils.default.getName();

// import 'core-js/stable'
// import 'regenerator-runtime/runtime'
// 1.arrow function
var arrowFun = function arrowFun() {
  console.log('arrow-function', _this);
}; // 2.class


var Factory = /*#__PURE__*/function () {
  function Factory(name, age) {
    _classCallCheck(this, Factory);

    this.name = name;
    this.age = age;
    this.hobbyMap = {
      read: true,
      write: true
    };
  }

  _createClass(Factory, [{
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }], [{
    key: "say",
    value: function say() {
      alert('hello');
    }
  }]);

  return Factory;
}();

Factory.play = function () {
  alert('play');
};

var Person = /*#__PURE__*/function (_Factory) {
  _inherits(Person, _Factory);

  var _super = _createSuper(Person);

  function Person(name, age, job) {
    var _this2;

    _classCallCheck(this, Person);

    // super(name)
    _this2.age = age;
    _this2.job = job;
    return _possibleConstructorReturn(_this2);
  }

  _createClass(Person, [{
    key: "getJob",
    value: function getJob() {
      return this.job;
    }
  }]);

  return Person;
}(Factory);

var p = new Person('yxp', 19, 'programmer'); // 3.promise es6新增

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