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

const reserved = new Set(['constructor', 'extends', 'static', 'super']);

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
    static: Statics,
    super: Args,
  } = definition;

  const hasConstructor = definition.hasOwnProperty('constructor');

  const Class = Super ?
    (isNative(Super) ?
      function Class() {
        const self = construct(
          Super,
          Args ? Args.map(reduced, arguments) : arguments,
          Class
        );
        if (hasConstructor)
          Constructor.apply(self, arguments);
        return self;
      } :
      function Class() {
        const override = Super.apply(
          this,
          Args ? Args.map(reduced, arguments) : arguments,
        );
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
      function Class() { }
    )
    ;

  const { prototype } = Class;

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

function reduced(i) {
  return this[i];
}
const console={log:print,assert(e,m){if(!e)print(m);}};


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
  extends: function () { }
});

console.assert(new ExtendNothing instanceof ExtendNothing, 'ExtendNothing');


const DoubleSet = Class({
  extends: Set,
  add(value) {
    return this.super.add(value * 2);
  }
});

const ms = new DoubleSet;
console.assert(ms.add(2) === ms, 'DoubleSet add');
console.assert(ms.has(4), 'DoubleSet has');

const A = Class({
  static: {
    test: 'A',
    method() {
      console.log(this.test + '.method');
    }
  },
  constructor(a) {
    this.a = a;
  },
  method() {
    console.log('A.prototype.method');
  }
});

const B = Class({
  extends: A,
  static: {
    test: 'B',
    method() {
      A.method();
      console.log(this.test + '.method');
    }
  },
  constructor(a, b) {
    this.super(a);
    this.b = b;
  },
  method() {
    this.super.method();
    console.log('B.prototype.method');
  }
});

const C = Class({
  extends: B,
  static: {
    test: 'C',
    method() {
      B.method();
      console.log(this.test + '.method');
    }
  },
  constructor(a, b, c) {
    this.super(a, b);
    this.c = c;
  },
  method() {
    this.super.method();
    console.log('C.prototype.method');
  }
});

console.assert(new C('a', 'b', 'c') instanceof C, 'C');
console.assert(new C('a', 'b', 'c') instanceof B, 'C');
console.assert(new C('a', 'b', 'c') instanceof A, 'C');
console.assert(new C('a', 'b', 'c').a === 'a', 'C.a');
console.assert(new C('a', 'b', 'c').b === 'b', 'C.b');
console.assert(new C('a', 'b', 'c').c === 'c', 'C.c');

new C('a', 'b', 'c').method();
C.method();

const args = [];
const Parent = Class({
  constructor(a, c) {
    args.push(a, c);
  }
});
const Child = Class({
  extends: Parent,
  super: [0, 2],
  constructor(a, b, c) {
    this.super(a, c);
    args.push(b);
  }
});
new Child('a', 'b', 'c');
console.assert(args.join(',') === 'a,c,b');

const ReMap = Class({
  extends: Map,
  super: [],
  constructor(key, value) {
    this.super();
    this.set(key, value);
  }
});
const rm = new ReMap('key', 'value');
console.assert(rm.get('key') === 'value');

console.log('\x1b[1mOK\x1b[0m');
