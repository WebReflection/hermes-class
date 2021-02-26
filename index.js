var HermesClass = (function (exports) {
  'use strict';

  const {
    defineProperties,
    getOwnPropertyDescriptor,
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

  var index = definition => {
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
    }

    define(prototype, definition);

    if (Statics)
      define(Class, Statics);

    return Class;
  };

  exports.default = index;

  return exports;

}({}).default);
