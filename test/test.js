import test from 'ava'
import Recht from '..'

test.beforeEach(t => {
  t.context.recht = new Recht()
})

test('Allows a rule', t => {
  t.context.recht.rules = [
    ['ALLOW', 'x']
  ]

  t.true(t.context.recht.check('x'))
})

test('Allows wildcard rules', t => {
  t.context.recht.rules = [
    ['ALLOW', '*']
  ]

  t.true(t.context.recht.check('x'))
})

test('Denies wildcard rules', t => {
  t.context.recht.rules = [
    ['DENY', '*']
  ]

  t.false(t.context.recht.check('x'))
})

test('With dimensions, denies a condition out of dimensions even though wildcard is used', t => {
  t.context.recht.rules = [
    ['ALLOW', '*']
  ]

  t.context.recht.dimensions = [
    ['x', 'y']
  ]

  t.false(t.context.recht.check('z'))
})

test('Denies a rule', t => {
  t.context.recht.rules = [
    ['DENY', 'x']
  ]

  t.false(t.context.recht.check('x'))
})

test('Rule order defines priority', t => {
  t.context.recht.rules = [
    ['DENY', 'x'],
    ['ALLOW', 'x']
  ]

  t.false(t.context.recht.check('x'))

  t.context.recht.rules = [
    ['ALLOW', 'x'],
    ['DENY', 'x']
  ]

  t.true(t.context.recht.check('x'))
})

test('Denies a condition outside of ruleset', t => {
  t.context.recht.rules = [
    ['ALLOW', 'x']
  ]

  t.false(t.context.recht.check('y'))
})

test('Performs a rule set', t => {
  const categories = ['Men', 'Women', 'Kids']
  const garments = ['Shirts', 'Jackets']
  const sizes = ['XS', 'S', 'M', 'L', 'XL']
  const colors = ['Brown', 'Black', 'Green', 'White']
  t.context.recht.dimensions = [categories, garments, sizes, colors]

  t.context.recht.rules = [
    ['DENY', 'Men', '*', 'XS'],
    ['DENY', '*', '*', '*', 'Brown'],
    ['DENY', ['Women', 'Kids'], '*', 'XL'],
    ['ALLOW', 'Kids', '*', '*', ['Black']],
    ['ALLOW', ['Women', 'Men'], '*', '*', ['Green', 'White']],
    ['DENY', 'Men', 'Shirts', ['S', 'M'], 'Black'],
    ['ALLOW', 'Men', 'Shirts', ['L', 'XL'], 'Black'],
    ['ALLOW', 'Men', 'Jackets', ['S', 'XL'], 'Black']
  ]

  const checkAssertions = [
    [['Men', 'Shirts', 'XS', 'Black'], false],
    [['Men', 'Shirts', 'S', 'Black'], false],
    [['Men', 'Shirts', 'S', 'Green'], true],
    [['Women', 'Jackets', 'XL'], false],
    [['Women', 'Shirts', 'L', 'White'], true],
    [['Women', 'Jackets', 'S', 'Green'], true],
    [['Kids', 'Shirts', 'XL'], false],
    [['Kids', 'Shirts'], true],
    [['Kids', 'Jackets', 'M', 'Green'], false],
    [['Kids', 'Shirts', 'M', 'Black'], true]
  ]

  const closestAssertions = [
    [['Men', 'Shirts', 'S', 'Black'], 'L'],
    [['Men', 'Shirts', 'S', 'Black', colors], 'Green'],
    [['Men', 'Shirts', 'S', 'Black', garments], 'Jackets'],
    [['Women', 'Jackets', 'XL', 'Green'], 'XS'],
    [['Women', 'Jackets', 'XL', 'Green', categories], 'Men'],
    [['Women', 'Shirts', 'XL', 'Black'], 'Men'],
    [['Kids', 'Jackets', 'S', 'Brown'], null]
  ]

  checkAssertions.forEach(([assertion, expected]) => {
    t.is(t.context.recht.check(...assertion), expected)
  })

  closestAssertions.forEach(([assertion, expected]) => {
    t.is(t.context.recht.closest(...assertion), expected)
  })
})

test('Throws if a rule has an unkown direction', t => {
  t.context.recht.rules = [['LET', '*']]
  const err = t.throws(() => t.context.recht.check('test'))
  t.is(err.message, 'Unknown action LET in rule "*" at index 0.')
})

test('Throws if no dimensions are set', t => {
  t.context.recht.rules = [['ALLOW', '*']]
  const err = t.throws(() => t.context.recht.closest('test'))
  t.is(err.message, 'Please provide a dimensions array in order to use the closest method.')
})
