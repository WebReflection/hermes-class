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

module.exports = definition => {
  const {
    constructor: Constructor,
    extends: Super,
    static: Statics
  } = definition;

  const Class = definition.hasOwnProperty('constructor') ?
    (Super ?
      function Class() {
        const self = construct(Super, arguments, Class);
        Constructor.apply(self, arguments);
        return setPrototypeOf(self, prototype);
      } :
      function Class() {
        return Constructor.apply(this, arguments);
      }
    ) :
    (Super ?
      (isNative(Super) ?
        function Class() {
          return construct(Super, arguments, Class);
        } :
        function Class() {
          const self = Super.apply(this, arguments);
          return self ? setPrototypeOf(self, prototype) : this;
        }
      ) :
      function Class() {}
    );

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
