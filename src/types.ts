export type Action = 'ALLOW' | 'DENY'

export type Dimension<V extends string = string> = readonly V[]
export type Dimensions = readonly Dimension[]

type DimensionValueAt<D extends Dimensions, I extends keyof D> =
  D[I] extends readonly (infer V extends string)[] ? V : never

export type RuleCondition<D extends Dimensions, I extends keyof D> =
  | DimensionValueAt<D, I>
  | readonly DimensionValueAt<D, I>[]
  | '*'

export type RuleConditions<D extends Dimensions> = {
  [I in keyof D]: RuleCondition<D, I>
}

type Prefixes<T extends readonly unknown[]> = T extends readonly []
  ? []
  : T | Prefixes<T extends readonly [...infer R, unknown] ? R : []>

export type RuleConditionsPrefix<D extends Dimensions> = Prefixes<RuleConditions<D>>

/**
 * A `Rule` is `[Action, ...conditions]`.
 *
 * Like the original JS implementation, a rule can define fewer conditions than
 * there are dimensions (meaning it doesn't constrain later dimensions).
 */
export type Rule<D extends Dimensions = Dimensions> = readonly [Action, ...RuleConditionsPrefix<D>]

export type ConditionTuple<D extends Dimensions> = {
  [I in keyof D]: DimensionValueAt<D, I>
}

/**
 * `check()` allows calling with fewer conditions than there are dimensions
 * (meaning: "any value" for the rest), but requires at least one condition.
 */
export type CheckArgs<D extends Dimensions> = Exclude<Prefixes<ConditionTuple<D>>, []>

export type UntypedRule = readonly [
  Action,
  ...Array<string | readonly string[] | '*'>
]

export type UntypedDefinitions = {
  rules: readonly UntypedRule[]
  dimensions?: readonly (readonly string[])[]
}

export type Definitions<D extends Dimensions = Dimensions> = {
  rules: readonly Rule<D>[]
  dimensions?: D
}

export type DefinitionsWithDimensions<D extends Dimensions = Dimensions> = {
  rules: readonly Rule<D>[]
  dimensions: D
}

export type ValueResult = string | null
export type ConditionsResult = readonly string[] | null

export type VerboseResult = {
  dimension: readonly string[] | null
  dimensionIndex: number | null
  value: string | null
  conditions: readonly string[] | null
}

