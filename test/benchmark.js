"use strict";

const {
  defineProperties,
  getOwnPropertyDescriptor,
  getPrototypeOf,
  setPrototypeOf,
  toString
} = Object;

const {
  construct,
  ownKeys
} = Reflect;

const reserved = new Set(['constructor', 'extends', 'static']);

const isNative = Class => toString.call(Class).includes('[native code]');

const define = (target, definition) => {
  const properties = {};
  for (const key of ownKeys(definition)) {
    if (!reserved.has(key)) {
      properties[key] = getOwnPropertyDescriptor(definition, key);
      properties[key].enumerable = false;
    }
  }
  defineProperties(target, properties);
};

const superProtoHandler = {
  get: (target, name) => (...args) => {
    const self = target();
    const proto = getPrototypeOf(self);
    const method = proto[name];
    let parent = proto;
    while ((method === parent[name]))
      parent = getPrototypeOf(parent);
    try {
      return parent[name].apply(setPrototypeOf(self, parent), args);
    }
    finally {
      setPrototypeOf(self, proto);
    }
  }
};

const superProto = {
  super: {
    get() {
      return new Proxy(() => this, superProtoHandler);
    }
  }
};


const Class = definition => {
  const {
    constructor: Constructor,
    extends: Super,
    static: Statics
  } = definition;

  const hasConstructor = definition.hasOwnProperty('constructor');

  const Class = Super ?
    (isNative(Super) ?
      function Class() {
        const self = construct(Super, arguments, Class);
        if (hasConstructor)
          Constructor.apply(self, arguments);
        return self;
      } :
      function Class() {
        const override = Super.apply(this, arguments);
        const self = override ? setPrototypeOf(override, prototype) : this;
        if (hasConstructor)
          Constructor.apply(self, arguments);
        return self;
      }
    ) :
    (hasConstructor ?
      function Class() {
        Constructor.apply(this, arguments);
      } :
      function Class() {}
    )
  ;

  const {prototype} = Class;

  if (Super) {
    setPrototypeOf(Class, Super);
    setPrototypeOf(prototype, Super.prototype);
    defineProperties(prototype, superProto);
  }

  if (Statics)
    define(Class, Statics);

  define(prototype, definition);

  return Class;
};

const hermes = !globalThis.console;
const log = hermes ? print : globalThis.console.log;


/*
class BabelSet extends Set {
  add() {
    for (let i = 0; i < arguments.length; i++)
    	super.add(arguments[i]);
    return this;
  }
}
*/

function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === "function" &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? "symbol"
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);
      if (desc.get) {
        return desc.get.call(receiver);
      }
      return desc.value;
    };
  }
  return _get(target, property, receiver || target);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }
  return object;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
      result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }
  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return self;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;
  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;
    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }
    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);
      _cache.set(Class, Wrapper);
    }
    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }
    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };
  return _wrapNativeSuper(Class);
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }
  return _construct.apply(null, arguments);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;
  try {
    Boolean.prototype.valueOf.call(
      Reflect.construct(Boolean, [], function () {})
    );
    return true;
  } catch (e) {
    return false;
  }
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
  return _setPrototypeOf(o, p);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

var BabelSet = /*#__PURE__*/ (function (_Set) {
  _inherits(BabelSet, _Set);

  var _super = _createSuper(BabelSet);

  function BabelSet() {
    _classCallCheck(this, BabelSet);

    return _super.apply(this, arguments);
  }

  _createClass(BabelSet, [
    {
      key: "add",
      value: function add() {
        for (var i = 0; i < arguments.length; i++) {
          _get(_getPrototypeOf(BabelSet.prototype), "add", this).call(
            this,
            arguments[i]
          );
        }

        return this;
      }
    }
  ]);

  return BabelSet;
})(/*#__PURE__*/ _wrapNativeSuper(Set));


const {add: Set_add} = Set.prototype;
const HermesSet = Class({
  extends: Set,
  add() {
    for (let i = 0; i < arguments.length; i++)
      Set_add.call(this, arguments[i]);
    return this;
  }
});

const HermesSetSuper = Class({
  extends: Set,
  add() {
    for (let i = 0; i < arguments.length; i++)
      this.super.add(arguments[i]);
    return this;
  }
});

const internal = Symbol('internal');

function FakeClass(...args) {
  this[internal] = new Set(...args);
}

Object.setPrototypeOf(FakeClass.prototype, Set.prototype);
Object.defineProperties(FakeClass.prototype, {
  add: {value() {
    for (let i = 0; i < arguments.length; i++)
      this[internal].add(arguments[i]);
    return this;
  }},
  has: {value(value) {
    return this[internal].has(value);
  }},
  size: {get() {
    return this[internal].size;
  }},
  [Symbol.iterator]: {get() {
    return this[internal][Symbol.iterator].bind(this[internal]);
  }}
});

function benchmark(name, Class, times = hermes ? 0xFFF : 0xFFFF) {
  return new globalThis.Promise((resolve, reject) => {
    log(`\x1b[1m${name}\x1b[0m`);

    // sanity check
    const instance = new Class([1, 2]);
    if (!instance.has(1) || !instance.has(2) || instance.size !== 2)
      reject('invalid constructor');
    instance.add(2, 3);
    if (!instance.has(3) || instance.size !== 3)
      reject('invalid method');
    if ([...instance].join(',') !== '1,2,3')
      reject('invalid behavior');

    const result = [];
    const tmp = [];
    let date = new Date;
    for (let i = 0; i < times; i++)
      result.push(new Class);
    date = new Date - date;
    log(` creation:  ${date}ms`);
    date = new Date;
    for (let i = 0; i < times; i++)
      result[i].add(1);
    date = new Date - date;
    log(` add(1):    ${date}ms`);
    date = new Date;
    for (let i = 0; i < times; i++)
      tmp[i] = result[i].has(1);
    date = new Date - date;
    log(` has(1):    ${date}ms`);
    date = new Date;
    for (let i = 0; i < times; i++)
      tmp[i] = result[i].size;
    date = new Date - date;
    log(` size:      ${date}ms`);
    date = new Date;
    for (let i = 0; i < times; i++)
      tmp[i] = [...result[i]];
    date = new Date - date;
    log(` @@iterate: ${date}ms`);
    log('');
    resolve();
  });
}

log('');

globalThis.Promise.resolve()
  .then(() => benchmark(' Fake Class', FakeClass))
  .then(() => benchmark(' Babel Class', BabelSet))
  .then(() => benchmark(' Hermes Class', HermesSet))
  .then(() => benchmark(' Hermes Class + super', HermesSetSuper))
;
