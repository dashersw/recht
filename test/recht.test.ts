import { describe, it, expect } from 'vitest'
import Recht from '../src'
import * as fixture from './helpers/fixture'

describe('Recht', () => {
  it('Allows a rule', () => {
    const recht = new Recht()
    const rules = [['ALLOW', 'x'] as const]
    recht.rules = rules

    expect(recht.check('x')).toBe(true)
    expect(Recht.check({ rules }, 'x')).toBe(true)
  })

  it('Supports constructing with definitions', () => {
    const recht = new Recht({
      dimensions: [['x', 'y']] as const,
      rules: [['ALLOW', 'x']] as const
    })

    expect(recht.check('x')).toBe(true)
    expect(recht.check('y')).toBe(false)
  })

  it('Allows wildcard rules', () => {
    const recht = new Recht()
    const rules = [['ALLOW', '*'] as const]
    recht.rules = rules

    expect(recht.check('x')).toBe(true)
    expect(Recht.check({ rules }, 'x')).toBe(true)
  })

  it('Denies wildcard rules', () => {
    const recht = new Recht()
    const rules = [['DENY', '*'] as const]
    recht.rules = rules

    expect(recht.check('x')).toBe(false)
    expect(Recht.check({ rules }, 'x')).toBe(false)
  })

  it('With dimensions, denies a condition out of dimensions even though wildcard is used', () => {
    const recht = new Recht()
    const rules = [['ALLOW', '*'] as const]
    const dimensions = [['x', 'y']] as const
    recht.rules = rules
    recht.dimensions = dimensions

    expect(recht.check('z')).toBe(false)
    expect(Recht.check({ rules, dimensions }, 'z')).toBe(false)
  })

  it('Denies a rule', () => {
    const recht = new Recht()
    const rules = [['DENY', 'x'] as const]
    recht.rules = rules

    expect(recht.check('x')).toBe(false)
    expect(Recht.check({ rules }, 'x')).toBe(false)
  })

  it('Rule order defines priority', () => {
    const recht = new Recht()
    recht.rules = [['DENY', 'x'] as const, ['ALLOW', 'x'] as const]

    expect(recht.check('x')).toBe(false)

    const rules = [['ALLOW', 'x'] as const, ['DENY', 'x'] as const]
    recht.rules = rules

    expect(recht.check('x')).toBe(true)
    expect(Recht.check({ rules }, 'x')).toBe(true)
  })

  it('Denies a condition outside of ruleset', () => {
    const recht = new Recht()
    const rules = [['ALLOW', 'x'] as const]
    recht.rules = rules

    expect(recht.check('y')).toBe(false)
    expect(Recht.check({ rules }, 'y')).toBe(false)
  })

  it('Performs a rule set', () => {
    const recht = new Recht()
    const { dimensions, rules, checkAssertions, closestAssertions } = fixture
    recht.dimensions = dimensions
    recht.rules = [...rules]

    for (const { input, expected } of checkAssertions) {
      expect(recht.check(...input)).toBe(expected.value)
      expect(Recht.check({ rules, dimensions }, ...input)).toBe(expected.value)
    }

    for (const { input, expected } of closestAssertions) {
      expect(recht.closest(...input)).toEqual(expected.conditions)
      expect(Recht.closest({ rules, dimensions }, ...input)).toEqual(expected.conditions)

      expect(recht.closestValue(...input)).toBe(expected.value)
      expect(Recht.closestValue({ rules, dimensions }, ...input)).toBe(expected.value)

      expect(recht.closestVerbose(...input)).toEqual(expected)
      expect(Recht.closestVerbose({ rules, dimensions }, ...input)).toEqual(expected)
    }
  })

  it('Check throws if no rules are set', () => {
    const recht = new Recht()
    expect(() => recht.check('test')).toThrowError('Please provide a rules array in order to use the check method.')
    expect(() => Recht.check(undefined, 'test')).toThrowError('Please provide a rules array in order to use the check method.')
    // @ts-expect-error testing null definitions
    expect(() => Recht.check(null, 'test')).toThrowError('Please provide a rules array in order to use the check method.')
  })

  it('Check throws if no conditions are given', () => {
    const recht = new Recht()
    const rules = [['ALLOW', '*'] as const]
    recht.rules = rules

    expect(() => recht.check()).toThrowError('Please provide conditions as arguments to the check call.')
    expect(() => Recht.check({ rules })).toThrowError('Please provide conditions as arguments to the check call.')
  })

  it('Check throws if a rule has an unknown direction', () => {
    const recht = new Recht()
    const rules = [['LET', '*'] as const]
    // @ts-expect-error testing invalid action type 'LET'
    recht.rules = rules

    expect(() => recht.check('test')).toThrowError('Unknown action LET in rule "*" at index 0.')
    // @ts-expect-error testing invalid action type 'LET'
    expect(() => Recht.check({ rules }, 'test')).toThrowError('Unknown action LET in rule "*" at index 0.')
  })

  it('Closest throws if no dimensions are set', () => {
    const recht = new Recht()
    expect(() => recht.closest('test')).toThrowError('Please provide a dimensions array in order to use the closest method.')
    expect(() => Recht.closest(undefined, 'test')).toThrowError('Please provide a dimensions array in order to use the closest method.')
  })

  it('Closest handles a single-dimension ruleset without stack overflow', () => {
    const dimensions = [['read', 'write', 'admin']] as const
    const rules = [['ALLOW', 'read'], ['ALLOW', 'write']] as const

    const recht = new Recht({ dimensions, rules })

    expect(recht.closest('admin')).toEqual(['read'])
    expect(recht.closestValue('admin')).toBe('read')

    expect(Recht.closest({ rules, dimensions }, 'admin')).toEqual(['read'])
    expect(Recht.closestValue({ rules, dimensions }, 'admin')).toBe('read')
  })

  it('Closest returns null for a single-dimension ruleset with no match', () => {
    const dimensions = [['read', 'write']] as const
    const rules = [['DENY', '*']] as const

    const recht = new Recht({ dimensions, rules })

    expect(recht.closest('read')).toBeNull()
    expect(recht.closestValue('read')).toBeNull()
    expect(recht.closestVerbose('read')).toEqual({
      dimension: null,
      dimensionIndex: null,
      value: null,
      conditions: null
    })
  })

  it('Closest functions throw if no dimensions are set', () => {
    const fns = [Recht.closest, Recht.closestValue, Recht.closestVerbose] as const

    for (const fn of fns) {
      // @ts-expect-error testing missing definitions and conditions
      expect(() => fn()).toThrowError('Please provide a dimensions array in order to use the closest method.')
    }
  })
})

