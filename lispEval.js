
const globalEnv = { // ignored arg validations in globalEnv
  '+': (...args) => args.reduce((sum, i) => sum + i),
  '-': (...args) => { if (args.length === 1) { return args[0] } return args.reduce((sum, i) => sum - i) },
  '*': (...args) => args.reduce((mul, i) => mul * i, 1),
  '/': (...args) => { if (args.length === 2) { return args[0] / args[1] } return null },
  '>': (...args) => args[0] > args[1],
  '<': (...args) => args[0] < args[1],
  '>=': (...args) => args[0] >= args[1],
  '<=': (...args) => args[0] <= args[1],
  '=': (...args) => args[0] === args[1],
  '#t': true,
  '#f': false,
  true: true,
  false: false,
  sqrt: (...args) => Math.sqrt(args[0]),
  abs: (...args) => Math.abs(args[0]),
  pi: Math.PI
}
const specialForms = ['if', 'define', 'quote', 'lambda', 'set!']

// numberEval
function numberEval (num) { // ignored num validation
  if (isNaN(Number(num))) { return null }
  return Number(num)
}

// symbolEval
function symbolEval (atom, env) { // ignored symbol validation
  if (env[atom] === undefined) { return null }
  return env[atom]
}

// stringEval
function stringEval (input) {
  const mached = input.match(/".*"/) // ignored string validation  [\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*
  if (mached) { return mached[0].trim() }
  return null
}

// atomEval
function atomEval (input, env) {
  if (numberEval(input) === 0) { return 0 }
  if (symbolEval(input, env) === false) { return false }
  return numberEval(input) || symbolEval(input, env) || stringEval(input)
}

// parseAtomOrExp // consumes an input and returns first expression enclosed in matching braces and rest of input
function parseAtomOrExp (input) {
  input = input.trim()
  if (input[0] !== '(') {
    const item = input.split(' ')[0]
    return [item, input.slice(item.length).trim()]
  }
  let str = input.slice(1)
  let braceCount = 1
  let iterCount = 0
  while (braceCount !== 0) {
    iterCount++
    if (iterCount > input.length) { return null }
    if (str[0] === '(') { braceCount++; str = str.slice(1) } else if (str[0] === ')') { braceCount--; str = str.slice(1) } else { str = str.slice(1) }
  }
  return [input.slice(0, input.length - str.length).trim(), str.trim()]
}

// getArgs // returns all arguments in input {inp = arg1, arg2, ...)} occuring before an unmatched )
function getArgs (input) {
  const args = []
  while (input[0] !== ')') {
    const parsedExp = parseAtomOrExp(input)
    args.push(parsedExp[0])
    input = parsedExp[1]
  }
  return args
}

// ifParser (if <test> <consequent> <alternate>)
function ifParser (input, env) {
  let parsedExp = parseAtomOrExp(input)
  const testArg = parsedExp[0]
  input = parsedExp[1]

  parsedExp = parseAtomOrExp(input)
  const passArg = parsedExp[0]
  input = parsedExp[1]

  parsedExp = parseAtomOrExp(input)
  const failArg = parsedExp[0]
  input = parsedExp[1]

  if (expressionEval(testArg, env) === false) { return expressionEval(failArg, env) }
  return expressionEval(passArg, env)
}

// defineParser // (define <variable> <expression>)
function defineParser (input, env) {
  let parsedExpression = parseAtomOrExp(input)
  const variable = parsedExpression[0]
  input = parsedExpression[1]

  parsedExpression = parseAtomOrExp(input)
  const expression = parsedExpression[0]
  input = parsedExpression[1]

  env[variable] = expressionEval(expression, env) // this can override an env variable // Section 2.9. Assignment (https://scheme.com/tspl4/start.html#./start:h4) (5.2.1  Top level definitions)  (https://schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-8.html#%_sec_5.2)
  return `${variable} defined`
}

// lambdaParser (lambda (args) body) or ((lambda (args) body) (parameters))
function lambdaParser (input, env) { // input = (arg1 arg2...) (body)
  if (input[0] !== '(') { return null }
  const parsed = parseAtomOrExp(input) // parsed[0] = (arg1 arg2...)
  input = parsed[1] // input = (body) // input = (body)) (exp))
  const parsedArgs = parsed[0].slice(1).trim() // parsedArgs = arg1 arg2...)

  const args = getArgs(parsedArgs)
  const parcedBody = parseAtomOrExp(input)
  const body = parcedBody[0]
  input = parcedBody[1]

  function lambdaFunc (...funcArgs) {
    const localEnv = Object.create(env)
    funcArgs.forEach((arg, index) => { localEnv[args[index]] = arg })
    return expressionEval(body, localEnv)
  }

  input = input.slice(1).trim()
  if (input.length === 0) { return lambdaFunc }
  const parameters = getArgs(input).map(i => expressionEval(i, env))
  return lambdaFunc(...parameters)
}

// (quote <datum>)  // input = ...)
const quoteParser = (input) => input.slice(0, input.length - 1).trim()

// set (set! symbol exp)
function setParser (input, env) {
  const getExp = parseAtomOrExp(input)
  const variable = getExp[0]
  input = getExp[1]
  if (env[variable] === undefined) { return null }
  env[variable] = expressionEval(parseAtomOrExp(input)[0], env)
  return `${variable} Set`
}

// special forms
function formParser (op, input, env) {
  if (op === 'if') { return ifParser(input, env) }
  if (op === 'define') { return defineParser(input, env) }
  if (op === 'lambda') { return lambdaParser(input, env) }
  if (op === 'quote') { return quoteParser(input) }
  if (op === 'set!') { return setParser(input, env) }
}

// compoundExpEval // evaluates a lisp expression enclosed in braces
function compoundExpEval (compExp, env) { // input = '(op arg1 arg2)'
  compExp = compExp.slice(1).trim() // op arg1 arg2)
  const parsedOpArgs = parseAtomOrExp(compExp)
  if (parsedOpArgs === null) { return null }
  const [op, args] = [parsedOpArgs[0], parsedOpArgs[1]]
  if (specialForms.includes(op)) { return formParser(op, args, env) }
  if (env[op] !== undefined) {
    const argsArr = getArgs(args).map(arg => expressionEval(arg, env))
    return env[op](...argsArr)
  }
}

// expressionEval // call atomEval if input = identifier and compoundExpEval if input = '(...)'
function expressionEval (expression, env) {
  if (expression[0] === '(') { return compoundExpEval(expression, env) }
  return atomEval(expression, env)
}

// main
function main (input) {
  input = input.replaceAll('(', '( ').replaceAll(')', ' )') // * or fix 'atom)' in parseAtomOrExp()
  return expressionEval(input, globalEnv)
}



// console.log(main('(define x 4 5)'))
// console.log(main('((lambda (y) (+ y x)) 5)'))

// console.log(main('(define twice (lambda (x) (* 2 x)))'))
// console.log(main('(twice 5)'))

// console.log(main('(define repeat (lambda (f) (lambda (x) (f (f x)))))'))
// console.log(main('((repeat twice) 10)'))
// ______________________________Math Cases_______________________________

console.log(main('-5 ') === -5)
console.log(main('pi') === 3.141592653589793)
console.log(main('-5') === -5)
console.log(main('(sqrt (/ 8 2))') === 2)
console.log(main('(* (/ 1 2) 3)') === 1.5)
console.log(main('(+ 1 (+ 2 3))') === 6)
console.log(main('( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )') === 22)
console.log(main('(+ (+ 1 (- 1 1)) 1)') === 2)
console.log(main('(* 5 10)') === 50)
// _____________________________________if_______________________________
console.log(main('( if (> 30 45) (+ 1 1) "failedOutput")') === '"failedOutput"')
console.log(main('(if (= 12 12) (+ 78 2) 9)') === 80)
console.log(main('(if #f 1 0)') === 0)
console.log(main('(if #t "abc" 1)') === '"abc"')
// ____________________________define____________________________________
let input
input = '(define a 90)'
main(input)
input = '(define x (+ 5 5) (* x x))'
main(input)
input = '(define circle-area (lambda (r) (* pi (* r r))))'
main(input)
console.log(main('(circle-area 3)') === 28.274333882308138)
input = '(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))'
main(input)
console.log(main('(fact 4)') === 24)
console.log(main('(fact 10)') === 3628800)
// ____________________________lambda__________________________________________

// let input
input = '((lambda (x) (+ x x)) (* 3 4))' // 24
console.log(main(input) === 24)

input = '(lambda (x) (+ x x))'
console.log(main(input))

// _____________________________________quote____________________________________

// let input

input = '(quote #(a b c))'
console.log(main(input) === '#( a b c )')

input = '(quote (+ 1 2)) '
console.log(main(input) === '( + 1 2 )')

//  _____________________________________set!____________________________________

main('(define r 1)')
main('(set! r 10)')
console.log(main('(+ r r )') === 20)

// ____________________________nested lambda______________________________________

main('(define rectangleArea (lambda (length) (lambda (bredth) (* length bredth))))')
main('(define areaLen2 (rectangleArea 2))')
console.log(main('(areaLen2 3)') === 6)

// ___________________________to pass____________________________
// console.log(main('- 1'))
