# hermes-class

[![Build Status](https://travis-ci.com/WebReflection/hermes-class.svg?branch=main)](https://travis-ci.com/WebReflection/hermes-class) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/hermes-class/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/hermes-class?branch=main) [![CSP strict](https://webreflection.github.io/csp/strict.svg)](https://webreflection.github.io/csp/#-csp-strict)

A [classtrophobic](https://github.com/WebReflection/classtrophobic#readme) inspired approach to define [Hermes](https://github.com/facebook/hermes#readme) compatible classes.

```js
import Class from 'hermes-class';

const MySet = Class({
  static: {name: 'MySet'},
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

## Benchmark

Following an `hermes -jit test/benchmark.js` run, using `0xFFF` iterations over a native *Set* extend:

|           |Fake Class |Babel Class|Hermes Class|Hermes Class + super|
|-----------|-----------|-----------|------------|--------------------|
|creation   | 493ms     | 797ms     | 378ms      | 363ms              |
|add(1)     | 54ms      | 71ms      | 68ms       | 953ms              |
|has(1)     | 55ms      | 92ms      | 53ms       | 73ms               |
|size       | 63ms      | 43ms      | 30ms       | 34ms               |
|@@iterate  | 920ms     | 443ms     | 416ms      | 400ms              |



### Fake Class

This is an old, repeated, bloated way, to simulate an *extend* without actually being an *extend*. This way is the fastest out there in *NodeJS*, but it shows not ideal performance in *Hermes*:

```js
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
```



### Babel Class

This class is [the transpiled version](https://babeljs.io/repl#?browsers=ie%20%3C%2011&build=&builtIns=entry&spec=false&loose=false&code_lz=MYGwhgzhAEBCYCMCmIDKSAu0kA8NIDsATGdLAbwChpowiiAKASmippoDMB7AJ2gZCZoAS2gBeaAAYA3COgAeWjwDmAVwC2hDBAB0ggsowALWcIDUZptXYBICKoAOSHjrqMwKjVogBtYQF0maWsaHkxVHgJoY2EIYJoAX0okoA&debug=false&forceAllTransforms=true&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=false&presets=env&prettier=true&targets=&version=7.13.8&externalPlugins=) of the following one:

```js
class BabelSet extends Set {
  add() {
    for (let i = 0; i < arguments.length; i++)
    	super.add(arguments[i]);
    return this;
  }
}
```



### Hermes Class

This is the suggested approach to *explictly* invoke *super* methods:

```js
const {add: Set_add} = Set.prototype;

const HermesSet = Class({
  extends: Set,
  add() {
    for (let i = 0; i < arguments.length; i++)
      Set_add.call(this, arguments[i]);
    return this;
  }
});
```



### Hermes Class + super

This class uses the *super* utility, but it is obvious it has a performance cost due runtime *prototype* swaps and &Proxy* creation and handling:

```js
const HermesSetSuper = Class({
  extends: Set,
  add() {
    for (let i = 0; i < arguments.length; i++)
      this.super.add(arguments[i]);
    return this;
  }
});
```
