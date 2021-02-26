# hermes-class

A [classtrophobic](https://github.com/WebReflection/classtrophobic#readme) inspired approach to define [Hermes](https://github.com/facebook/hermes#readme) compatible classes.

```js
import Class from 'hermes-class';

const MySet = Class({
  static: {name: 'MySet'}
  extends: Set,
  get length() {
    return this.size;
  }
});
```

## Why

*Hermes* doesn't support `class` yet, but pretty much everything else is in. As transpiling classes has been extremely awkward, in both *Babel* or *TypeScript*, and since about ever, this module provides a transpiler friendly way to define, and extend, classes, 

The idea behind is that *Hermes* is already fairly compatible with *ES2015*, plus latest *JS* features, so that a lot of unnecessary overhead can be removed from previous attempt to make classes transpilation-proof, as it was for *classtrophobic* project.

### Features

  * create generic classes or *extend* native classes with an *ES6* friendly *API* based on object literal.
  * avoid undesired transpilation bloat and not fully expected behavior.
  * obtain great performance in *Hermes* for projects heavily based on classes.
  * define accessors and static properties, simplifying future refactoring.
  * allows using `this.super(...)` in constructor, *as no-op*, and proxied `this.super.method(...)` within **methods only** (*not static*).

### Goals

  * provide an *ad-hoc* minimal overhead to define classes in *Hermes*, keeping well known semantics and keywords around for easy future refactoring.
  * try to perform as good as possible, keeping *classes* expectations around, without providing *full ES2015* behavior, as that's hard, or messed up, even after transpilation (i.e. `Symbol.species` which is not supported in *Hermes* has no reason to be even polyfilled).
  * last, but not least, **become obsolete** as soon as *Hermes* classes become a reality.

### Caveats

  * it is *not possible* to return a different context/instance from any constructor.
  * it is *not possible* to use `this.super(...)`, within the constructor, in any meaningful way. Signatures are sealed with extends, and super invoked by default with the provided arguments. However, since signature have a precise length, it is possible to add extra, irrelevant, arguments, example:

```js
const MySet = Class({
  extends: Set,
  constructor(alreadyPassed, value) {
    // super already invoked in here!
    // so the following is possible
    // but it effectively does nothing
    this.super(alreadyPassed);
    this.value = value;
  }
});

const ms = new MySet([1, 2, 3], "anything");
ms.size;  // 3, it contains 1, 2, and 3
ms.value; // "anything"
```

To obtain a *method* `super` call, either use an explicit prototype call (suggested), or the proxied dance:

```js
const MySet = Class({
  extends: Set,
  add(value) {
    // suggested method (when performance matters)
    // return Set.prototype.add.call(this, value * 2);

    // provided proxied alternative
    return this.super.add(value * 2);
  }
});

const ms = new MySet;
ms.add(2);
ms.has(4);  // true
```
