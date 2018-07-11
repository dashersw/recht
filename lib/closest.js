/**
 * Searches for the closest alternative available to a given `rules` array, within the given
 * `dimensions`. It recursively searches an alternative starting from a specified dimension. If no dimensions
 * are specified, the starting dimension is always the penultimate dimension. This method can return the
 * results in various forms, including null, if no matches are found.
 *
 * @param {Recht} recht An object with `dimensions` and `rules` definitions and a `check` function.
 * @param {ResultOptions} opts Options to define the return type. Return type can either be a simple
 *                             string value (`ValueResult`), the whole matching condition array
 *                             (`ConditionsResult`), or a `VerboseResult` object with verbose fields.
 * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
 *
 * @throws {Error} Throws if no dimensions are provided.
 *
 * @return {ValueResult|ConditionsResult|VerboseResult} The result formatted based on the given `ResultOptions`
 */
function closest (recht, opts, ...conditions) {
  const { dimensions = [], rules, check } = recht

  if (!dimensions.length) {
    throw new Error(`Please provide a dimensions array in order to use the closest method.`)
  }

  const dimensionIndex = dimensions.indexOf(conditions[conditions.length - 1])

  if (dimensionIndex == -1) {
    return closest(recht, opts, ...conditions, dimensions[dimensions.length - 2])
  }

  const dimension = conditions.pop()

  for (let value of dimension) {
    const oldValue = conditions[dimensionIndex]
    conditions[dimensionIndex] = value

    if (check({ rules, dimensions }, ...conditions)) {
      if (opts._dimension) {
        return { dimension, dimensionIndex, value, conditions }
      }
      return opts._partial ? value : conditions
    }

    conditions[dimensionIndex] = oldValue

    if (dimensionIndex == 0) {
      if (opts._dimension) {
        return { dimension: null, dimensionIndex: null, value: null, conditions: null }
      }

      return null
    }
  }

  return closest(recht, opts, ...conditions, dimensions[dimensionIndex - 1])
}

/** @typedef {Array.<string>} Dimension */
/** @typedef {Array.<string>} Rule */
/** @typedef {Array.<string>} Conditions */
/** @typedef {{dimensions: Array.<Dimension>, rules: Array.<Rule>, check: function}} Recht */
/** @typedef {{_partial: boolean, _dimension: boolean}} ResultOptions */
/** @typedef {string} ValueResult */
/** @typedef {Array.<string>} ConditionsResult */
/** @typedef {{dimension: Dimension, dimensionIndex: number, value: string, conditions: Conditions}} VerboseResult */

module.exports = closest
