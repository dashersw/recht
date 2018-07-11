const categories = ['Men', 'Women', 'Kids']
const garments = ['Shirts', 'Jackets']
const sizes = ['XS', 'S', 'M', 'L', 'XL']
const colors = ['Brown', 'Black', 'Green', 'White']
const dimensions = [categories, garments, sizes, colors]

const rules = [
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
  { input: ['Men', 'Shirts', 'XS', 'Black'], expected: { value: false } },
  { input: ['Men', 'Shirts', 'S', 'Black'], expected: { value: false } },
  { input: ['Men', 'Shirts', 'S', 'Green'], expected: { value: true } },
  { input: ['Women', 'Jackets', 'XL'], expected: { value: false } },
  { input: ['Women', 'Shirts', 'L', 'White'], expected: { value: true } },
  { input: ['Women', 'Jackets', 'S', 'Green'], expected: { value: true } },
  { input: ['Kids', 'Shirts', 'XL'], expected: { value: false } },
  { input: ['Kids', 'Shirts'], expected: { value: true } },
  { input: ['Kids', 'Jackets', 'M', 'Green'], expected: { value: false } },
  { input: ['Kids', 'Shirts', 'M', 'Black'], expected: { value: true } }
]

const closestAssertions = [
  {
    input: ['Men', 'Shirts', 'S', 'Black'],
    expected: {
      value: 'L',
      conditions: ['Men', 'Shirts', 'L', 'Black'],
      dimension: sizes,
      dimensionIndex: 2
    }
  },
  {
    input: ['Men', 'Shirts', 'S', 'Black', colors],
    expected: {
      value: 'Green',
      conditions: ['Men', 'Shirts', 'S', 'Green'],
      dimension: colors,
      dimensionIndex: 3
    }
  },
  {
    input: ['Men', 'Shirts', 'S', 'Black', garments],
    expected: {
      value: 'Jackets',
      conditions: ['Men', 'Jackets', 'S', 'Black'],
      dimension: garments,
      dimensionIndex: 1
    }
  },
  {
    input: ['Women', 'Jackets', 'XL', 'Green'],
    expected: {
      value: 'XS',
      conditions: ['Women', 'Jackets', 'XS', 'Green'],
      dimension: sizes,
      dimensionIndex: 2
    }
  },
  {
    input: ['Women', 'Jackets', 'XL', 'Green', categories],
    expected: {
      value: 'Men',
      conditions: ['Men', 'Jackets', 'XL', 'Green'],
      dimension: categories,
      dimensionIndex: 0
    }
  },
  {
    input: ['Women', 'Shirts', 'XL', 'Black'],
    expected: {
      value: 'Men',
      conditions: ['Men', 'Shirts', 'XL', 'Black'],
      dimension: categories,
      dimensionIndex: 0
    }
  },
  {
    input: ['Kids', 'Jackets', 'S', 'Brown'],
    expected: {
      value: null,
      conditions: null,
      dimension: null,
      dimensionIndex: null
    }
  }
]

module.exports = {
  categories,
  garments,
  sizes,
  colors,
  dimensions,
  rules,
  checkAssertions,
  closestAssertions
}
