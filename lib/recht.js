const closest = require('./closest')
const check = require('./check')

/**
 * A concise rule engine to express and enforce rules for selections, permissions and the like.
 */
class Recht {
  constructor () {
    /**
     * `Rule`s define which conditions to `ALLOW` or `DENY`.
     *
     * @type {Array.<Rule>}
     */
    this.rules = []

    /**
     * `Dimension`s define the set of possible values for each `Condition` in a `Rule`.
     *
     * @type {Array.<Dimension>}
     */
    this.dimensions = []
  }

  /**
   * Check function receives an arbitrary number of conditions. Returns a `boolean` whose value depends on
   * whether the given conditions match the definitions.
   *
   * @param {...string} conditions Conditions to check if they are allowed within the given rule definition.
   *
   * @throws {Error} Throws if no rules or conditions are provided.
   *
   * @return {boolean} Whether the given condition set is allowed according to the definitions.
   */
  check (...conditions) {
    return Recht.check(this, ...conditions)
  }

  /**
   * Searches for the closest alternative to a given condition. Requires `dimensions` to be set.
   * It recursively searches an alternative starting from a specified dimension. If no dimensions
   * are specified, the starting dimension is always the penultimate dimension. This method returns
   * a set of conditions that is the closest alternative to the given set or null if no matches are found.
   *
   * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
   *
   * @throws {Error} Throws if no dimensions are provided.
   *
   * @return {ConditionsResult} The matching conditions as an array.
   */
  closest (...conditions) {
    return Recht.closest(this, ...conditions)
  }

  /**
   * Searches for the closest alternative to a given condition. Requires `dimensions` to be set.
   * It recursively searches an alternative starting from a specified dimension. If no dimensions
   * are specified, the starting dimension is always the penultimate dimension. This method returns
   * a simple value of a given condition, or null if no matches are found. Since the return value is a
   * simple value, this method is only useful if the dimension is not known beforehand. For more
   * information on the search result, use `closest` or `closestVerbose`.
   *
   * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
   *
   * @throws {Error} Throws if no dimensions are provided.
   *
   * @return {ValueResult} The matching condition as a simple value.
   */
  closestValue (...conditions) {
    return Recht.closestValue(this, ...conditions)
  }

  /**
   * Searches for the closest alternative to a given condition. Requires `dimensions` to be set.
   * It recursively searches an alternative starting from a specified dimension. If no dimensions
   * are specified, the starting dimension is always the penultimate dimension. This method returns
   * a verbose object (`VerboseResult`) that returns the `dimension`, `dimensionIndex`, `value` and
   * `conditions` that make up the closest alternative.
   *
   * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
   *
   * @throws {Error} Throws if no dimensions are provided.
   *
   * @return {VerboseResult} The matching condition as a simple value.
   */
  closestVerbose (...conditions) {
    return Recht.closestVerbose(this, ...conditions)
  }
}

/**
 * Check function receives a `Definitions` object with `dimensions` and `rules`, and an arbitrary number of
 * conditions. Returns a `boolean` whose value depends on whether the given conditions match the definitions.
 *
 * @param {Definitions=} definitions An object with `dimensions` and `rules`.
 * @param {...string} conditions Conditions to check if they are allowed within the given rule definition.
 *
 * @throws {Error} Throws if no rules or conditions are provided.
 *
 * @return {boolean} Whether the given condition set is allowed according to the definitions.
 */
Recht.check = check

/**
 * Searches for the closest alternative to a given condition. Requires `dimensions` to be set.
 * It recursively searches an alternative starting from a specified dimension. If no dimensions
 * are specified, the starting dimension is always the penultimate dimension. This method returns
 * a set of conditions that is the closest alternative to the given set or null if no matches are found.
 *
 * @param {Definitions=} definitions An object with `dimensions` and `rules`.
 * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
 *
 * @throws {Error} Throws if no dimensions are provided.
 *
 * @return {ConditionsResult} The matching conditions as an array.
 */
Recht.closest = (definitions = {}, ...conditions) => closest({ ...definitions, check }, {}, ...conditions)

/**
 * Searches for the closest alternative to a given condition. Requires `dimensions` to be set.
 * It recursively searches an alternative starting from a specified dimension. If no dimensions
 * are specified, the starting dimension is always the penultimate dimension. This method returns
 * a simple value of a given condition, or null if no matches are found. Since the return value is a
 * simple value, this method is only useful if the dimension is not known beforehand. For more
 * information on the search result, use `closest` or `closestVerbose`.
 *
 * @param {Definitions} definitions An object with `dimensions` and `rules`.
 * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
 *
 * @throws {Error} Throws if no dimensions are provided.
 *
 * @return {ValueResult} The matching condition as a simple value.
 */
Recht.closestValue = (definitions = {}, ...conditions) => closest({ ...definitions, check }, { _partial: true }, ...conditions)

/**
 * Searches for the closest alternative to a given condition. Requires `dimensions` to be set.
 * It recursively searches an alternative starting from a specified dimension. If no dimensions
 * are specified, the starting dimension is always the penultimate dimension. This method returns
 * a verbose object (`VerboseResult`) that returns the `dimension`, `dimensionIndex`, `value` and
 * `conditions` that make up the closest alternative.
 *
 * @param {Definitions} definitions An object with `dimensions` and `rules`.
 * @param {...string} conditions Conditions to look for the closest alternative allowed by the `rules` set.
 *
 * @throws {Error} Throws if no dimensions are provided.
 *
 * @return {VerboseResult} The matching condition as a simple value.
 */
Recht.closestVerbose = (definitions = {}, ...conditions) => closest({ ...definitions, check }, { _dimension: true }, ...conditions)

/** @typedef {Array.<string>} Dimension */
/** @typedef {Array.<string>} Rule */
/** @typedef {{dimensions: Array.<Dimension>, rules: Array.<Rule>}} Definitions */
/** @typedef {Array.<string>} Conditions */
/** @typedef {string} ValueResult */
/** @typedef {Array.<string>} ConditionsResult */
/** @typedef {{dimension: Dimension, dimensionIndex: number, value: string, conditions: Conditions}} VerboseResult */

module.exports = Recht
