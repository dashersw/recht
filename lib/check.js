/**
 * Receives a `Definitions` object with `dimensions` and `rules`, and an arbitrary number of
 * conditions. Returns a `boolean` whose value depends on whether the given conditions match the definitions.
 *
 * @param {Definitions=} definitions An object with `dimensions` and `rules`.
 * @param {...string} conditions Conditions to check if they are allowed within the given rule definition.
 *
 * @throws {Error} Throws if no rules or conditions are provided.
 *
 * @return {boolean} Whether the given condition set is allowed according to the definitions.
 */
function check (definitions = {}, ...conditions) {
  const { rules = [], dimensions = [] } = definitions

  if (!rules.length) {
    throw new Error(`Please provide a rules array in order to use the check method.`)
  }

  if (!conditions.length) {
    throw new Error(`Please provide conditions as arguments to the check call.`)
  }

  const Actions = ['ALLOW', 'DENY']

  for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
    const rule = rules[ruleIndex].slice()
    const action = rule.shift()

    if (!Actions.includes(action)) {
      throw new Error(`Unknown action ${action} in rule "${rule}" at index ${ruleIndex}.`)
    }

    const rv = rule.every((condition, i) => {
      if (conditions.length <= i) return action == 'ALLOW'

      if (condition == '*') {
        if (dimensions.length) return dimensions[i].includes(conditions[i])
        return true
      }

      if (!Array.isArray(condition)) condition = [condition]
      return condition.includes(conditions[i])
    })

    if (rv) return action == 'ALLOW'
  }

  return false
}

/** @typedef {Array.<string>} Dimension */
/** @typedef {Array.<string>} Rule */
/** @typedef {{dimensions: Array.<Dimension>, rules: Array.<Rule>}} Definitions */

module.exports = check
