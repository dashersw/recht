import type { ConditionsResult, UntypedDefinitions, UntypedRule, ValueResult, VerboseResult } from './types'

type RechtLike = {
  rules: readonly UntypedRule[]
  dimensions: readonly (readonly string[])[]
  check: (definitions: UntypedDefinitions | undefined, ...conditions: string[]) => boolean
}

type ClosestMode = 'conditions' | 'value' | 'verbose'

export function closest (recht: RechtLike, mode: 'conditions', ...conditions: Array<string | readonly string[]>): ConditionsResult
export function closest (recht: RechtLike, mode: 'value', ...conditions: Array<string | readonly string[]>): ValueResult
export function closest (recht: RechtLike, mode: 'verbose', ...conditions: Array<string | readonly string[]>): VerboseResult
export function closest (
  recht: RechtLike,
  mode: ClosestMode,
  ...conditions: Array<string | readonly string[]>
): ConditionsResult | ValueResult | VerboseResult
export function closest (
  recht: RechtLike,
  mode: ClosestMode,
  ...conditions: Array<string | readonly string[]>
): ConditionsResult | ValueResult | VerboseResult {
  const { dimensions = [], rules, check } = recht

  if (!dimensions.length) {
    throw new Error('Please provide a dimensions array in order to use the closest method.')
  }

  const lastCondition = conditions[conditions.length - 1]
  const dimensionIndex = typeof lastCondition !== 'string'
    ? dimensions.indexOf(lastCondition)
    : -1

  if (dimensionIndex === -1) {
    const fallbackDimension = dimensions.length === 1
      ? dimensions[0]
      : dimensions[dimensions.length - 2]
    return closest(recht, mode, ...conditions, fallbackDimension)
  }

  const dimension = conditions.pop() as readonly string[]
  const checkConditions = conditions as string[]

  for (const value of dimension) {
    const oldValue = checkConditions[dimensionIndex]
    checkConditions[dimensionIndex] = value

    if (check({ rules, dimensions }, ...checkConditions)) {
      if (mode === 'verbose') {
        return { dimension, dimensionIndex, value, conditions: checkConditions }
      }
      return mode === 'value' ? value : checkConditions
    }

    checkConditions[dimensionIndex] = oldValue

    if (dimensionIndex === 0) {
      if (mode === 'verbose') {
        return { dimension: null, dimensionIndex: null, value: null, conditions: null }
      }
      return null
    }
  }

  return closest(recht, mode, ...conditions, dimensions[dimensionIndex - 1])
}

