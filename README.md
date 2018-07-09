# Das Recht — A concise rule engine to express and enforce rules for selections, permissions and the like

[![npm version](https://badge.fury.io/js/recht.svg)](https://badge.fury.io/js/recht)
[![Build Status](https://travis-ci.org/dashersw/recht.svg?branch=master)](https://travis-ci.org/dashersw/recht)
[![Coverage Status](https://coveralls.io/repos/github/dashersw/recht/badge.svg)](https://coveralls.io/github/dashersw/recht)
[![dependencies Status](https://david-dm.org/dashersw/recht/status.svg)](https://david-dm.org/dashersw/recht)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/dashersw/recht/master/LICENSE)

**Das Recht enables you to customize your application's behavior based on simple rules, without the need of a database or an expensive query engine.**

```js
const recht = new Recht()
recht.rules = [
  ['DENY', 'T-shirts', 'S', ['Black', 'Blue']],
  ['DENY', 'T-shirts', ['M', 'L'], 'Black'],
  ['ALLOW', 'T-shirts', '*', '*']
]

recht.check('T-shirts', 'S', 'Black') // false
recht.check('T-shirts', 'M', 'Blue') // true
recht.check('T-Shirts', 'L', 'Black') // false
```

## Features
- Declarative, logic-less rules
- Lightweight, zero dependencies
- Generic engine for any application
- Wildcard support for arbitary conditions
- Simple recommendation engine for the closest alternative available
- Ordered rules for lighter expressions

## Possible use cases
- Access control lists to manage whether a given user has permission on a resource
- Feature toggling to determine which features to show in a certain environment (QA, UA, Production)
- A/B testing to determine which features are available to which category of users
- E-commerce applications where some product variants may be unavailable (disabling black shirts only for size S)

## Usage
### Installation
Install Recht via npm:

```bash
$ npm install recht
```
### Setting up
Require and instantiate Recht.

```js
const Recht = require('recht')
const recht = new Recht()
```

### Defining rules
Recht accepts an array of rules, which are arrays of conditions in themselves. A rule may either be an `ALLOW` rule or a `DENY` rule, the first element of the rule array should always be either `ALLOW` or `DENY`.

If a condition matches an `ALLOW` rule, the check will return `true`. If a condition matches a `DENY` rule, the check will return `false`. Recht will go through the rules in the `rules` array one by one in the order of declaration, and return as soon as any of the rules match. Therefore, the order of the rules are very important. If there's no match, the check will fail and return `false`.

```js
const Recht = require('recht')
const recht = new Recht()

recht.rules = [
  ['ALLOW', ['Master', 'Developer'], 'push', '*'], // allow masters & developers to push to any branch
  ['ALLOW', 'Master', 'force push', 'master'], // allow masters to force push to the master branch
  ['DENY', 'QA', 'clone', 'production'], // disallow QA from cloning production
  ['ALLOW', '*', 'clone'], // allow anyone to clone any branch
]
```

### Checks

Once you define your rules, you can check any condition against them with the `check` method. The following example checks if the `'Developer'` can `'push'` to `'master'`.
```js
recht.check('Developer', 'push', 'master')
```

If you are only interested whether a `'Developer'` can push to any branch at all, you can omit the last argument and call the `check` function with only two arguments as the following:
```js
recht.check('Developer', 'push')
```

This feature is useful for checking group matches or hierarchical structures. It assumes the rest of the arguments can be of any value. If you wish to keep one of the latter arguments, but use the any value mechanism in one of the earlier arguments, you can use [wildcards][#wildcards].

### Wildcards
Recht accepts `'*'` as a wildcard condition. In this case, any value for that condition will be accepted as a match. The following example gives anybody clone access to any branch.

```js
recht.rules = [
  ['ALLOW', '*', 'clone']
]
```

Read on to [Dimensions](#dimensions) to learn how to constraint the wildcard to only accept known values.

### Dimensions
Each rule in the rule set should include the same number of conditions in them. In the following example there are 3 conditions in each rule.

```js
recht.rules = [  
  ['ALLOW', 'Gold member', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], ['Swimming pool', 'Gym', 'Sauna']],
  ['DENY', 'Guest', ['Mon', 'Tue'], 'Sauna'],
  ['ALLOW', ['Guest', 'Regular member'], '*', '*']
]
```

The set of possible values for a condition is called a dimension. The first dimension is the membership type, the second dimension is the facilities a member has access to, and the last one is the days the the facilities can be used. These dimensions can be expressed as follows:

```js
const memberships = ['Gold member', 'Regular member', 'Guest']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const facilities = ['Swimming pool', 'Gym', 'Sauna']
```

If these values are known ahead of time and passed to Recht, Recht opens up two further features. The first one is constraining the wildcard: without defining dimensions, a wildcard accepts any arbitrary value, and this might be an unwanted case. The following example uses dimensions to constrain the wildcard to known values:

```js
recht.check('Guest', 'Sat') // true, since no dimensions are defined yet
recht.dimensions = [memberships, days, facilities]
recht.check('Guest', 'Sat') // false, since Sat isn't included in the days dimension
```

The first check passes, because initially we haven't defined the dimensions. As we define the dimensions, the second check fails because `Sat` is not an element in the `days` dimension.

```js
recht.dimensions = [memberships, facilities, days]
recht.check('')
```

### Finding the closest alternatives available

Once you have defined [dimensions](#dimensions), Recht can be used to predict the closest choice available. This is a very handy feature if you want to show what is possible for a given rule set. See the following example on how to make the best of this feature:

```js
const Recht = require('recht')
const recht = new Recht()

const memberships = ['Gold Member', 'Regular member', 'Guest']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const facilities = ['Swimming pool', 'Gym', 'Sauna']

recht.dimensions = [memberships, days, facilities]

recht.rules = [
  ['ALLOW', 'Gold member', '*', '*'],
  ['DENY', 'Guest', ['Mon', 'Tue'], 'Sauna'],
  ['ALLOW', ['Guest', 'Regular member'], '*', '*']
]

recht.check('Guest', 'Mon', 'Sauna') // false
recht.closest('Guest', 'Mon', 'Sauna') // 'Wed'
recht.closest('Guest', 'Mon', 'Sauna', facilities) // 'Swimming pool'
```

In this example, Guests can't use the `Sauna` on `Mon`, therefore the check fails. Recht assumes that the last dimension, although the final chain in the hierarchy, is the stationary choice when we are looking for alternatives. Therefore, when invoked with the same arguments, `closest` gives us `Wed`, which is the next day a `Guest` can use the `Sauna`.

If we would like to start the search for the closest alternative from the last dimension (i.e, facilities), we can do so by indicating which dimension we want the `closest` search to start from. This happens as a result of passing the dimension as the last argument to the `closest` call. Notice that `closest` takes advantage of references, therefore the dimension that we pass in as the last argument to the `closest` call has to be a member of the original `dimensions` array.

In this case, the answer will be `Swimming pool`. This means that if a `Guest` is looking for alternatives that they can use on `Mon` only, they can use the `Swimming pool`.

Since the last argument can be any dimension, one last example question we can ask `Recht` is the following: "What kind of a membership do I need in order to be able to use the `Sauna` on `Mon`?" This call is as follows:


```js
recht.closest('Guest', 'Mon', 'Sauna', memberships) // 'Regular member'
```

As you see, Recht is capable of several advanced use cases. The `closest` search is very handy if you are building a feature set and want to guide your users to the right selection for certain features they want.

## Contribution

Recht is under development, and is open to suggestions and contributions.

If you would like to see a feature implemented or want to contribute a new feature, you are welcome to open an issue to discuss it and we will be more than happy to help.

If you choose to make a contribution, please fork this repository, work on a feature and submit a pull request.

## MIT License

Copyright (c) 2018 Armagan Amcalar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
