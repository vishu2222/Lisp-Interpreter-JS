
const env = {
  '+': (arr) => arr.reduce((sum, i) => sum + i, 0),
  '-': (arr) => arr[0] - arr[1],
  '*': (arr) => arr.reduce((mul, i) => mul * i, 1),
  '/': (arr) => arr[0] / arr[1],
  '>': (arr) => arr[0] > arr[1],
  '<': (arr) => arr[0] < arr[1],
  '>=': (arr) => arr[0] >= arr[1],
  '<=': (arr) => arr[0] <= arr[1],
  '=': (arr) => arr[0] === arr[1],
  sqrt: (arr) => Math.sqrt(arr[0]),
  abs: (arr) => Math.abs(arr[0])
}

function numberParser (input) {
  const output = input.match(/^[-+]?([1-9]\d*|0)(\.\d+)?([eE][+-]?\d+)?/) // need to extend to complex range, a/b form , +|- nan.0, +|-inf.0
  if (output) { return [Number(output[0]), input.slice(output[0].length)] }
  return null
}

function symbolParser (input) {
  const output = input.match(/^[\w!$%&*/:<=?>~_^+-/*]+[\w\d]*\s/) // update regex to include other chars
  if (output) { return [output[0], input.slice(output[0].length)] }
  return null
}

function atomParser (input) {
  return numberParser(input) || symbolParser(input) // an atom is a number or symbol
}

function getListArg (input) {
  let count = 1
  let str = input.slice(1)
  while (count !== 0) {
    if (str[0] === '(') {
      count++
      str = str.slice(1)
    } else if (str[0] === ')') {
      count--
      str = str.slice(1)
    } else { str = str.slice(1) }
  }
  return [input.slice(0, input.length - str.length), str] // returns [listArg, rest of the string]
}

function getArgs (input) { // input = arg1, arg2,..) args are either atom or list expressions
  const args = []
  while (input[0] !== ')') { // the last ) in the input is reached?
    if (input[0] === '(') { // list expression
      const arg = getListArg(input) //
      args.push(expressionEval(arg[0]))
      input = arg[1].trim()
    } else { // get atom expression
      const parsed = atomParser(input)
      if (!parsed) { return null }
      args.push(parsed[0])
      input = parsed[1].trim()
    }
  }
  return args
}

// evaluates a list expression and returns its value. a list expression = (operation arg1 arg2...) where arg is an atom or a list expression
function expressionEval (input) {
  if (input[0] !== '(') { return null } // input = (op arg1 arg2 ...)
  input = input.slice(1).trim() // input = op arg1 arg2 ...)
  const op = atomParser(input)[0].trim() // operation = +,-,> or other operations
  if (op === null) { console.log('error: invalid op'); return null } // not a valid operator
  if (!Object.keys(env).includes(op)) { return null } // op in enviornment?
  input = atomParser(input)[1].trim() // input = arg1 arg2 ...)
  if (input === null) { return null }
  const args = getArgs(input) // getArgs('(arg1 arg2...)') = [exp1Val, exp2Val ...]
  if (args === null) { return null }
  return env[op](args) // op([exp1Val, exp2Val ...])
}

function evaluate (input) {
  input = input.replaceAll('(', '( ').replaceAll(')', ' )') // not required
  return expressionEval(input)
}

const input = '(+ (+ 1 (- 1 1)) 2)'
// const input = '(sqrt (/ 8 2))'
console.log(evaluate(input))
