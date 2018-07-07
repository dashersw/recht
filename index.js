class Recht {
  constructor () {
    this.rules = []
    this.dimensions = []
  }

  check (...args) {
    for (let ruleIndex = 0; ruleIndex < this.rules.length; ruleIndex++) {
      const rule = this.rules[ruleIndex].slice()
      const action = rule.shift()

      if (!Recht.Actions.includes(action)) {
        throw new Error(`Unknown action ${action} in rule "${rule}" at index ${ruleIndex}.`)
      }

      const rv = rule.every((condition, i) => {
        if (args.length <= i) return action == 'ALLOW'

        if (condition == '*') {
          if (this.dimensions.length) return this.dimensions[i].includes(args[i])
          return true
        }

        if (!Array.isArray(condition)) condition = [condition]
        return condition.includes(args[i])
      })

      if (rv) return action == 'ALLOW'
    }
    return false
  }

  closest (...args) {
    if (!this.dimensions.length) {
      throw new Error(`Please provide a dimensions array in order to use the closest method.`)
    }

    const dimension = args[args.length - 1]
    const i = this.dimensions.indexOf(dimension)

    if (i == -1) return this.closest(...args, this.dimensions[this.dimensions.length - 2])

    for (let v of dimension) {
      args[i] = v
      if (this.check(...args)) return v
    }

    if (i == 0) return null

    return this.closest(...args, this.dimensions[i - 1])
  }
}

Recht.Actions = ['ALLOW', 'DENY']

module.exports = Recht
