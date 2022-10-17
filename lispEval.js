
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

// numberParser
function numberParser (input) {
  const output = input.match(/^[-+]?([1-9]\d*|0)(\.\d+)?([eE][+-]?\d+)?/) // need to extend to complex range, a/b form , +|- nan.0, +|-inf.0
  if (output) { return [Number(output[0]), input.slice(output[0].length).trim()] }
  return null
}

// symbolParser
function symbolParser (input) {
  const output = input.match(/^[\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*\s/) // need to verify for all cases
  if (output) { return [output[0].trim(), input.slice(output[0].length).trim()] }
  return null
}

// atomParser
function atomParser (input) {
  return numberParser(input) || symbolParser(input) // an atom is a number or symbol
}

// booleanParser
function booleanParser (input) { // anything that is not false or #f is true in scheme
  if (input[0] !== '(') {
    const temp = atomParser(input)
    return [temp[0], temp[1]]
  }
  if (input[0] === '(') {
    const temp = getListArg(input)
    const testArg = temp[0]
    input = temp[1].trim()
    const parsed = expressionEval(testArg)
    if (parsed === false) { return [false, input] }
    else { return [true, input] }
  }
  console.log('invalid test consdition in if')
  return null
}

// ifParser // (if <test> <consequent> <alternate>) another form // (if <test> <consequent>) 
function ifParser (input, env) { // testCondition passCase failCase)
  let parsed = booleanParser(input)
  if (parsed === null) { console.log('can\'t parse testCondition'); return null }
  const testCondition = parsed[0]
  input = parsed[1].trim()

  parsed = getListArg(input) || atomParser(input)
  if (parsed === null) { return null }
  const passCase = parsed[0]
  input = parsed[1]

  parsed = getListArg(input) || atomParser(input)
  if (parsed === null) { return null }
  const failCase = parsed[0]
  input = parsed[1]

  if (testCondition === false || testCondition === '#f') { //  || testCondition === '#f'
    if (failCase[0] === '(') { return [expressionEval(failCase), input] }
    return [failCase, input]
  }

  if (passCase[0] === '(') { return [expressionEval(passCase), input] }
  return [passCase, input]
}

// defineParser // (define <variable> <expression>)
function defineParser (input, env) {
  let parsed = symbolParser(input)
  if (parsed === null) { console.log('cannot parse symbol in define parser'); return null }
  const key = parsed[0]
  input = parsed[1]

  if (input[0] === '(') {
    const parsed = getListArg(input)
    if (parsed === null) { console.log('cannot parse listArg in define parser'); return null }
    input = parsed[1]
    env[key] = expressionEval(parsed[0])
  } else {
    parsed = symbolParser(input)
    if (parsed === null) { console.log('cannot parse atom in define parser'); return null }
    env[key] = parsed[0]
    input = parsed[1].trim()
  }
  return input
  // console.log(input, '...')
}

// special forms
function formParser (op, input, env) {
  if (op === 'if') { return ifParser(input, env) }
  if (op === 'define') { return defineParser(input, env) }
}

// returns first list expression argument from an input
function getListArg (input) { // input = (getThisArg) ()...())
  if (input[0] !== '(') { return null }
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
  return [input.slice(0, input.length - str.length), str.trim()] // returns [listArg, rest of the string] // change to returning evaluated exp?
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

// expression evaluater
function expressionEval (input, env = globalEnv) { // input = (op arg1 arg2 ...) arg is an atom or expression
  if (input === null) { return null }
  input = input.slice(1).trim() // input = op arg1 arg2 ...)

  const parsed = symbolParser(input) // operators(including special forms) are symbols
  if (parsed === null) { console.log('error parsing op'); return null } // not a valid operator
  const op = parsed[0]
  input = parsed[1] // input = arg1, arg2,...)

  if (specialForms.includes(op)) { // if op belongs to (define, quote, if...)
    const parsed = formParser(op, input, env)
    if (parsed === null || parsed === undefined) { return null }
    return parsed[0]
  }

  const localScope = Object.keys(env)
  const globalScope = Object.keys(Object.getPrototypeOf(env))
  if (!localScope.includes(op) && !globalScope.includes(op)) { return null }
  const args = getArgs(input, env) // getArgs('(arg1 arg2...)') = [exp1Val, exp2Val ...] // input = arg1, arg2,...)
  if (args === null) { console.log('err: invalid expression'); return null }
  return env[op](...args) // op([exp1Val, exp2Val ...])
}

// evaluate input
function evaluate (input) {
  input = input.replaceAll('(', '( ').replaceAll(')', ' )')
  console.log('input:', input)
  if (input[0] !== '(') { return null }
  const env = Object.create(globalEnv)
  return expressionEval(input, env)
}

let input
input = '( define x (+ 2 2))'
console.log(evaluate(input))

// _____________________________________tests____________________________________________

// // Math

// input = '(+ (+ 1 (- 1 1)) 2)' // 3
// console.log(evaluate(input) === 3)

// input = '(sqrt (/ 8 2))' // 2
// console.log(evaluate(input) === 2)

// input = '(* (/ 1 2) 3)' // 1.5
// console.log(evaluate(input) === 1.5)

// input = '(+ 1 (+ 2 3))' // 6
// console.log(evaluate(input) === 6)

// input = '( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )' // 22
// console.log(evaluate(input) === 22)

// input = '(+ (+ 1 (- 1 1)) 1)' // 2
// console.log(evaluate(input) === 2)

// input = '(* 5 10)' // 50
// console.log(evaluate(input) === 50)

// // _____________________________________if____________________________________________

// input = '( if (> 30 45) (+ 1 1) failedOutput)'
// console.log(evaluate(input) === 'failedOutput')

// input = '(if (= 12 12) (+ 78 2) 9)'
// console.log(evaluate(input) === 80)

// input = '(if #f 1 0)'
// console.log(evaluate(input) === 0)

// input = '(if #t abc 1)'
// console.log(evaluate(input) === 'abc')

// // _________________________________________________________________________________
