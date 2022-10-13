
const env = {
  '+': (arr) => arr.reduce((sum, i) => sum + i, 0),
  '-': (arr) => arr[0] - arr[1]
}

// symbol and number paresrs
function atomParser (input) {
  let output = input.match(/^-?([1-9]\d*|0)(\.\d+)?([eE][+-]?\d+)?/) // need to extend to complex range, a/b form , +|- nan.0, +|-inf.0
  if (output) { return [Number(output[0]), input.slice(output[0].length)] }
  output = input.match(/^"([^\\"]|\\["\\bfnrt/]|\\u[0-9a-fA-F]{4})*"/) // change regex
  if (output) { return [output[0], input.slice(output[0].length)] }
  return null
}

function getExpressionArg (input) {
  let count = 1
  let str = input.slice()
  str = str.slice(1)
  while (count !== 0) {
    if (str[0] === '(') {
      count++
      str = str.slice(1)
    } else if (str[0] === ')') {
      count--
      str = str.slice(1)
    } else { str = str.slice(1) }
  }
  return [input.slice(0, input.length - str.length), str]
}

function getArgs (input) { // input = (exp) (exp) ...(exp))
  const args = []
  while (input[0] !== ')') {
    if (input[0] === '(') { // means the arg is an expression
      const arg = getExpressionArg(input) // if val = null?
      args.push(expressionEval(arg[0]))
      input = arg[1].trim()
    } else {
      const parsed = atomParser(input)
      if (!parsed) { return null }
      args.push(parsed[0])
      input = parsed[1].trim()
    }
  }
  return args
}

// evaluates an expression and returns its value exp => expVal // (function args) -> val
function expressionEval (input) {
  // input = (func (exp) (exp) ...)
  if (input[0] !== '(') { return null }
  input = input.slice(1).trim() // remove ( and trim spaces // input = func (exp) (exp) ...)
  const func = input.split(/\s/)[0] // func is an operation in env // func = +
  if (!Object.keys(env).includes(func)) { return null } // if func doesnt belong to env return null
  input = input.slice(func.length).trim() // rest of the input after removing func part
  const args = getArgs(input) // getArgs('(exp) (exp) ...)') = [exp1Val, exp2Val ...]
  return env[func](args) // func([exp1Val, exp2Val ...])
}

function evaluate (input) {
  input = input.replaceAll('(', '( ').replaceAll(')', ' )')
  if (input[0] !== '(') { return null } // should start with (
  return expressionEval(input)
}

// const input = '(+ (+ 1 1) 1)'
// const input = '(+ 1 (+ 2 3))'
// const input = '( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )'
const input = '(+ (+ 1 (+ 1 1)) 1)'
console.log(evaluate(input))
