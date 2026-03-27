import type { Definitions, Dimensions, UntypedDefinitions } from './types'

const Actions = ['ALLOW', 'DENY'] as const

export function check (definitions: UntypedDefinitions | undefined, ...conditions: string[]): boolean
export function check<D extends Dimensions> (definitions: Definitions<D> | undefined, ...conditions: string[]): boolean
export function check (definitions: Partial<UntypedDefinitions> | null | undefined, ...conditions: string[]): boolean {
  const { rules = [], dimensions = [] } = definitions ?? {}

  if (!rules.length) {
    throw new Error('Please provide a rules array in order to use the check method.')
  }

  if (!conditions.length) {
    throw new Error('Please provide conditions as arguments to the check call.')
  }

  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const [action, ...ruleConditions] = rules[ruleIndex]

    if (!Actions.includes(action)) {
      throw new Error(`Unknown action ${action} in rule "${ruleConditions}" at index ${ruleIndex}.`)
    }

    const rv = ruleConditions.every((condition, i: number) => {
      if (conditions.length <= i) return action === 'ALLOW'

      if (condition === '*') {
        if (dimensions.length) return dimensions[i].includes(conditions[i])
        return true
      }

      const matches = Array.isArray(condition) ? condition : [condition]
      return matches.includes(conditions[i])
    })

    if (rv) return action === 'ALLOW'
  }

  return false
}

