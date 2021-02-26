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
  }

  define(prototype, definition);

  if (Statics)
    define(Class, Statics);

  return Class;
};
const console={assert(e,m){if(!e)print(m);}};


const Base = Class({});

console.assert(new Base instanceof Base, 'Base');

const BaseStatic = Class({
  static: {
    test: 'OK'
  }
});

console.assert(new BaseStatic instanceof BaseStatic, 'BaseStatic');
console.assert(BaseStatic.test === 'OK', 'BaseStatic');

const Constructed = Class({
  constructor() {
    this.test = 'OK';
  }
});

console.assert(new Constructed instanceof Constructed, 'Constructed');
console.assert((new Constructed).test === 'OK', 'Constructed');

const Extend = Class({
  extends: Set
});

console.assert(new Extend instanceof Extend, 'Extend');
console.assert(new Extend instanceof Set, 'Extend');

const ExtendConstructed = Class({
  extends: Set,
  constructor() {
    this.test = 'OK';
  }
});

console.assert(new ExtendConstructed instanceof ExtendConstructed, 'ExtendConstructed');
console.assert(new ExtendConstructed instanceof Set, 'ExtendConstructed');
console.assert(new ExtendConstructed([1, 2]).size === 2, 'ExtendConstructed');
console.assert(new ExtendConstructed([1, 2]).test === 'OK', 'ExtendConstructed');

const ExtendFurther = Class({
  extends: ExtendConstructed,
  constructor(values) {
    this.values = values;
  }
});

console.assert(new ExtendFurther instanceof ExtendFurther, 'ExtendFurther instanceof ExtendFurther');
console.assert(new ExtendFurther instanceof Set, 'ExtendFurther instanceof Set');
console.assert(new ExtendFurther([1, 2]).size === 2, 'ExtendFurther size');
console.assert(new ExtendFurther([1, 2]).test === 'OK', 'ExtendFurther test');
console.assert(new ExtendFurther([1, 2]).values.join(',') === '1,2', 'ExtendFurther values');

const ExtendFurtherLess = Class({
  extends: ExtendConstructed
});

console.assert(new ExtendFurtherLess instanceof ExtendFurtherLess, 'ExtendFurtherLess');
console.assert(new ExtendFurtherLess instanceof Set, 'ExtendFurtherLess');
console.assert(new ExtendFurtherLess([1, 2]).size === 2, 'ExtendFurtherLess');
console.assert(new ExtendFurtherLess([1, 2]).test === 'OK', 'ExtendFurtherLess');

const ExtendNothing = Class({
  extends: function () {}
});

console.assert(new ExtendNothing instanceof ExtendNothing, 'ExtendNothing');


const DoubleSet = Class({
  extends: Set,
  add(value) {
    return Set.prototype.add.call(this, value * 2);
  }
});

const ms = new DoubleSet;
console.assert(ms.add(2) === ms, 'DoubleSet add');
console.assert(ms.has(4), 'DoubleSet has');
