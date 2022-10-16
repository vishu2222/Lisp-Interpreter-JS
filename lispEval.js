
const globalEnv = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '=': (a, b) => a === b,
  sqrt: (a) => Math.sqrt(a),
  abs: (a) => Math.abs(a)
}

function numberParser (input) {
  const output = input.match(/^[-+]?([1-9]\d*|0)(\.\d+)?([eE][+-]?\d+)?/) // need to extend to complex range, a/b form , +|- nan.0, +|-inf.0
  if (output) { return [Number(output[0]), input.slice(output[0].length).trim()] }
  return null
}

function symbolParser (input) {
  const output = input.match(/^[\w!$%&*/:<=?>~_^+-/*]+[\w\d]*\s/) // update regex to include other chars
  if (output) { return [output[0].trim(), input.slice(output[0].length).trim()] }
  return null
}

function atomParser (input) {
  return numberParser(input) || symbolParser(input) // an atom is a number or symbol
}

function booleanParser (input) { // anything that is not false or #f is true in scheme
  if (input.startsWith('true')) { return [true, input.slice(4)] }
  if (input.startsWith('#t')) { return [true, input.slice(2)] }
  if (input.startsWith('#f')) { return [false, input.slice(2)] }
  if (input.startsWith('false')) { return [false, input.slice(5)] }
  if (input[0] === '(') {
    const temp = getListArg(input)
    const testArg = temp[0]
    input = temp[1].trim()
    const output = expressionEval(testArg)
    if (output === 'false' || output === '#f') { return [false, input] }
    else { return [true, input] }
  }
  console.log('invalid test consdition in if')
  return null
}

function ifParser (input) { // testCondition passCase failCase)
  const parsed = booleanParser(input)
  if (parsed === null) { console.log('can\'t parse testCondition'); return null }
  const test = parsed[0]
  input = parsed[1]

  if (test === false) {
    let failCase
    if (input[0] === '(') {
      const temp = getListArg(input)
      if (temp === null) { return null }
      failCase = expressionEval(temp[0])
      if (failCase === null) { return null }
      input = temp[1].trim()
    } else {
      const temp = atomParser(input)
      if (temp === null) { return null }
      failCase = temp[0]
      input = temp[1].trim()
    }
    return [failCase, input]
  }

  let passCase
  if (input[0] === '(') {
    const temp = getListArg(input)
    if (temp === null) { return null }
    passCase = expressionEval(temp[0])
    if (passCase === null) { return null }
    input = temp[1].trim()
  } else {
    const temp = atomParser(input)
    if (temp === null) { return null }
    passCase = temp[0]
    input = temp[1].trim()
  }
  return [passCase, input]
}

// (define symbol exp)
function defineParser (input) {

}

// special forms
function formParser (op, input) {
  if (op === 'if') { return ifParser(input) }
  if (op === 'define') { defineParser(input) }
}

// seperating list expression argument
function getListArg (input) { // input = (getThisArg) ()...())
  let count = 1
  let str = input.slice(1) // str = getThisArg) ()...()) , count = 1 // getThisArg is anything between ( and a matching )
  while (count !== 0) { // case when count !== 0?
    if (str[0] === '(') {
      count++
      str = str.slice(1)
    } else if (str[0] === ')') {
      count--
      str = str.slice(1)
    } else { str = str.slice(1) }
  }
  return [input.slice(0, input.length - str.length), str] // returns [listArg, rest of the string] // change to returning evaluated exp?
}

// get atom args and expression args
function getArgs (input) { // input = arg1, arg2,..) args are either atom or list expressions
  const args = []
  while (input[0] !== ')') { // i.e is while the last ')' in the input is not reached
    if (input[0] === '(') { // if the arg is a list expression
      const ParsedList = getListArg(input) //
      if (ParsedList === null) { return null }
      input = ParsedList[1].trim()
      const arg = expressionEval(ParsedList[0])
      if (arg === null) { return null }
      args.push(arg)
    } else { // get atom expression
      const parsed = atomParser(input)
      if (parsed === null) { return null }
      args.push(parsed[0])
      input = parsed[1]
    }
  }
  return args
}

const specialForms = ['if', 'define', 'quote']

function expressionEval (input, env = globalEnv) { // input = (op arg1 arg2 ...) arg is an atom or expression
  if (input[0] !== '(') { return null }
  input = input.slice(1).trim() // input = op arg1 arg2 ...)

  const parsed = symbolParser(input) // operators(including special forms) are symbols
  if (parsed === null) { console.log('error parsing op'); return null } // not a valid operator
  const op = parsed[0]
  input = parsed[1] // input = arg1, arg2,...)

  if (specialForms.includes(op)) { // if op belongs to (define, quote, if...)
    const result = formParser(op, input)
    if (result === null) { return null }
    return result[0]
  }

  if (!Object.keys(env).includes(op)) { return null }
  const args = getArgs(input) // getArgs('(arg1 arg2...)') = [exp1Val, exp2Val ...] // input = arg1, arg2,...)
  if (args === null) { console.log('err: invalid expression'); return null }
  return env[op](...args) // op([exp1Val, exp2Val ...])
}

let input
// input = '( define x (2 + 2))'
// console.log(evaluate(input))

// _____________________________________tests____________________________________________

// // Math

input = '(+ (+ 1 (- 1 1)) 2)' // 3
console.log(expressionEval(input) === 3)

input = '(sqrt (/ 8 2))' // 2
console.log(expressionEval(input) === 2)

input = '(* (/ 1 2) 3)' // 1.5
console.log(expressionEval(input) === 1.5)

input = '(+ 1 (+ 2 3))' // 6
console.log(expressionEval(input) === 6)

input = '( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )' // 22
console.log(expressionEval(input) === 22)

input = '(+ (+ 1 (- 1 1)) 1)' // 2
console.log(expressionEval(input) === 2)

input = '(* 5 10)' // 50
console.log(expressionEval(input) === 50)

// // _____________________________________if____________________________________________

input = '( if (> 30 45) (+ 45 56) failedOutput)'
console.log(expressionEval(input) === 'failedOutput')

input = '(if (= 12 12) (+ 78 2) 9)'
console.log(expressionEval(input) === 80)

input = '(if #f 1 0)'
console.log(expressionEval(input) === 0)

// // _________________________________________________________________________________
