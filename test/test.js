import test from 'ava'
import Recht from '..'
import fixture from './helpers/fixture'

test.beforeEach(t => {
  t.context.recht = new Recht()
})

test('Allows a rule', t => {
  const rules = t.context.recht.rules = [
    ['ALLOW', 'x']
  ]

  t.true(t.context.recht.check('x'))
  t.true(Recht.check({ rules }, 'x'))
})

test('Allows wildcard rules', t => {
  const rules = t.context.recht.rules = [
    ['ALLOW', '*']
  ]

  t.true(t.context.recht.check('x'))
  t.true(Recht.check({ rules }, 'x'))
})

test('Denies wildcard rules', t => {
  const rules = t.context.recht.rules = [
    ['DENY', '*']
  ]

  t.false(t.context.recht.check('x'))
  t.false(Recht.check({ rules }, 'x'))
})

test('With dimensions, denies a condition out of dimensions even though wildcard is used', t => {
  const rules = t.context.recht.rules = [
    ['ALLOW', '*']
  ]

  const dimensions = t.context.recht.dimensions = [
    ['x', 'y']
  ]

  t.false(t.context.recht.check('z'))
  t.false(Recht.check({ rules, dimensions }, 'z'))
})

test('Denies a rule', t => {
  const rules = t.context.recht.rules = [
    ['DENY', 'x']
  ]

  t.false(t.context.recht.check('x'))
  t.false(Recht.check({ rules }, 'x'))
})

test('Rule order defines priority', t => {
  let rules = t.context.recht.rules = [
    ['DENY', 'x'],
    ['ALLOW', 'x']
  ]

  t.false(t.context.recht.check('x'))

  rules = t.context.recht.rules = [
    ['ALLOW', 'x'],
    ['DENY', 'x']
  ]

  t.true(t.context.recht.check('x'))
  t.true(Recht.check({ rules }, 'x'))
})

test('Denies a condition outside of ruleset', t => {
  const rules = t.context.recht.rules = [
    ['ALLOW', 'x']
  ]

  t.false(t.context.recht.check('y'))
  t.false(Recht.check({ rules }, 'y'))
})

test('Performs a rule set', t => {
  const { dimensions, rules, checkAssertions, closestAssertions } = fixture
  t.context.recht.dimensions = dimensions
  t.context.recht.rules = rules

  checkAssertions.forEach(({ input, expected }) => {
    t.is(t.context.recht.check(...input), expected.value)
    t.is(Recht.check({ rules, dimensions }, ...input), expected.value)
  })

  closestAssertions.forEach(({ input, expected }) => {
    t.deepEqual(t.context.recht.closest(...input), expected.conditions)
    t.deepEqual(Recht.closest({ rules, dimensions }, ...input), expected.conditions)

    t.is(t.context.recht.closestValue(...input), expected.value)
    t.is(Recht.closestValue({ rules, dimensions }, ...input), expected.value)

    let result = t.context.recht.closestVerbose(...input)
    t.deepEqual(result, expected)

    result = Recht.closestVerbose({ rules, dimensions }, ...input)
    t.deepEqual(result, expected)
  })
})

test('Check throws if no rules are set', t => {
  let err = t.throws(() => t.context.recht.check('test'))
  t.is(err.message, 'Please provide a rules array in order to use the check method.')

  err = t.throws(() => Recht.check(undefined, 'test'))
  t.is(err.message, 'Please provide a rules array in order to use the check method.')
})

test('Check throws if no conditions are given', t => {
  const rules = t.context.recht.rules = [['ALLOW', '*']]

  let err = t.throws(() => t.context.recht.check())
  t.is(err.message, 'Please provide conditions as arguments to the check call.')

  err = t.throws(() => Recht.check({ rules }))
  t.is(err.message, 'Please provide conditions as arguments to the check call.')
})

test('Check throws if a rule has an unkown direction', t => {
  const rules = t.context.recht.rules = [['LET', '*']]
  let err = t.throws(() => t.context.recht.check('test'))
  t.is(err.message, 'Unknown action LET in rule "*" at index 0.')

  err = t.throws(() => Recht.check({ rules }, 'test'))
  t.is(err.message, 'Unknown action LET in rule "*" at index 0.')
})

test('Closest throws if no dimensions are set', t => {
  let err = t.throws(() => t.context.recht.closest('test'))
  t.is(err.message, 'Please provide a dimensions array in order to use the closest method.')

  err = t.throws(() => Recht.closest('test'))
  t.is(err.message, 'Please provide a dimensions array in order to use the closest method.')
})

test('Closest functions throw if no dimensions are set', t => {
  [Recht.closest, Recht.closestValue, Recht.closestVerbose].forEach(fn => {
    let err = t.throws(() => fn())
    t.is(err.message, 'Please provide a dimensions array in order to use the closest method.')
  })
})
