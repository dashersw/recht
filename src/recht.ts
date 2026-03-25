import { check } from './check'
import { closest } from './closest'
import type {
  CheckArgs,
  ConditionsResult,
  Definitions,
  DefinitionsWithDimensions,
  Dimensions,
  Rule,
  UntypedDefinitions,
  ValueResult,
  VerboseResult
} from './types'

type ConstructorOptions<D extends Dimensions> = Partial<DefinitionsWithDimensions<D>>

export class Recht<D extends Dimensions = Dimensions> {
  rules: Array<Rule<D>>
  dimensions: D | []

  constructor (opts?: ConstructorOptions<D>) {
    this.rules = (opts?.rules ? Array.from(opts.rules) : []) as Array<Rule<D>>
    this.dimensions = (opts?.dimensions ?? []) as D | []
  }

  check (...conditions: CheckArgs<D>): boolean {
    return check(
      {
        rules: this.rules as unknown as UntypedDefinitions['rules'],
        dimensions: this.dimensions as unknown as NonNullable<UntypedDefinitions['dimensions']>
      },
      ...(conditions as unknown as string[])
    )
  }

  closest (...conditions: Array<string | readonly string[]>): ConditionsResult {
    return closest(
      {
        rules: this.rules as unknown as UntypedDefinitions['rules'],
        dimensions: this.dimensions as unknown as NonNullable<UntypedDefinitions['dimensions']>,
        check
      },
      'conditions',
      ...conditions
    )
  }

  closestValue (...conditions: Array<string | readonly string[]>): ValueResult {
    return closest(
      {
        rules: this.rules as unknown as UntypedDefinitions['rules'],
        dimensions: this.dimensions as unknown as NonNullable<UntypedDefinitions['dimensions']>,
        check
      },
      'value',
      ...conditions
    )
  }

  closestVerbose (...conditions: Array<string | readonly string[]>): VerboseResult {
    return closest(
      {
        rules: this.rules as unknown as UntypedDefinitions['rules'],
        dimensions: this.dimensions as unknown as NonNullable<UntypedDefinitions['dimensions']>,
        check
      },
      'verbose',
      ...conditions
    )
  }

  static check = check as <DD extends Dimensions> (definitions: Definitions<DD> | undefined, ...conditions: string[]) => boolean

  static closest = (<DD extends Dimensions> (
    definitions: DefinitionsWithDimensions<DD> | undefined,
    ...conditions: Array<string | readonly string[]>
  ) =>
    closest(
      {
        rules: ((definitions?.rules ?? []) as unknown) as UntypedDefinitions['rules'],
        dimensions: ((definitions?.dimensions ?? []) as unknown) as NonNullable<UntypedDefinitions['dimensions']>,
        check
      },
      'conditions',
      ...conditions
    )) as <DD extends Dimensions> (
    definitions: DefinitionsWithDimensions<DD> | undefined,
    ...conditions: Array<string | readonly string[]>
  ) => ConditionsResult

  static closestValue = (<DD extends Dimensions> (
    definitions: DefinitionsWithDimensions<DD> | undefined,
    ...conditions: Array<string | readonly string[]>
  ) =>
    closest(
      {
        rules: ((definitions?.rules ?? []) as unknown) as UntypedDefinitions['rules'],
        dimensions: ((definitions?.dimensions ?? []) as unknown) as NonNullable<UntypedDefinitions['dimensions']>,
        check
      },
      'value',
      ...conditions
    )) as <DD extends Dimensions> (
    definitions: DefinitionsWithDimensions<DD> | undefined,
    ...conditions: Array<string | readonly string[]>
  ) => ValueResult

  static closestVerbose = (<DD extends Dimensions> (
    definitions: DefinitionsWithDimensions<DD> | undefined,
    ...conditions: Array<string | readonly string[]>
  ) =>
    closest(
      {
        rules: ((definitions?.rules ?? []) as unknown) as UntypedDefinitions['rules'],
        dimensions: ((definitions?.dimensions ?? []) as unknown) as NonNullable<UntypedDefinitions['dimensions']>,
        check
      },
      'verbose',
      ...conditions
    )) as <DD extends Dimensions> (
    definitions: DefinitionsWithDimensions<DD> | undefined,
    ...conditions: Array<string | readonly string[]>
  ) => VerboseResult
}

export default Recht

