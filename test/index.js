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
    return Set.prototype.add.call(this, value * 2);
  }
});

const ms = new DoubleSet;
console.assert(ms.add(2) === ms, 'DoubleSet add');
console.assert(ms.has(4), 'DoubleSet has');
