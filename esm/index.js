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


export default definition => {
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

function reduced(i) {
  return this[i];
}
