const Class = require('../cjs/index.js');

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

console.log('\x1b[1mOK\x1b[0m');
