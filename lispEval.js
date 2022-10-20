
const globalEnv = {
  '+': (...args) => args.reduce((sum, i) => sum + i),
  '-': (...args) => args.reduce((sum, i) => sum - i),
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
  pi: 3.14
}
const specialForms = ['if', 'define', 'quote', 'lambda']

// numberEval
function numberEval (num) { // add regex validation for num
  if (Number(num) === null || isNaN(Number(num))) { return null }
  // if (isNaN(Number(num))) { return null }
  return Number(num)
}

// symbolEval
function symbolEval (atom, env) { // add regex validation for symbol
  if (env[atom] === undefined) { return null }
  return env[atom]
}

// stringParser
function stringEval (input) {
  const mached = input.match(/".+"/) // add regex validation for string [\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*
  if (mached) { return mached[0].trim() }
  return null
}

// atomEval // potential errors when evaluaters return null or false in ||
function atomEval (input, env) {
  if (numberEval(input) === 0) { return 0 }
  if (symbolEval(input, env) === false) { return false }
  return numberEval(input) || symbolEval(input, env) || stringEval(input)
}

// getExpression
function getExpression (input) {
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

// getArgs
function getArgs (input) {
  const args = []
  while (input[0] !== ')') {
    const parsedExp = getExpression(input)
    args.push(parsedExp[0])
    input = parsedExp[1]
  }
  return args
}

// ifParser (if <test> <consequent> <alternate>)
function ifParser (input, env) {
  let parsedExp = getExpression(input)
  const testArg = parsedExp[0]
  input = parsedExp[1]

  parsedExp = getExpression(input)
  const passArg = parsedExp[0]
  input = parsedExp[1]

  parsedExp = getExpression(input)
  const failArg = parsedExp[0]
  input = parsedExp[1]

  if (expressionEval(testArg, env) === false) { return expressionEval(failArg, env) }
  return expressionEval(passArg, env)
}

// defineParser // (define <variable> <expression>)
function defineParser (input, env) {
  let parsedExpression = getExpression(input)
  const variable = parsedExpression[0]
  input = parsedExpression[1]

  parsedExpression = getExpression(input)
  const expression = parsedExpression[0]
  input = parsedExpression[1]

  env[variable] = expressionEval(expression, env) // this can override an env variable // Section 2.9. Assignment (https://scheme.com/tspl4/start.html#./start:h4) (5.2.1  Top level definitions)  (https://schemers.org/Documents/Standards/R5RS/HTML/r5rs-Z-H-8.html#%_sec_5.2)
  return `${variable} = ${env[variable]}`
}

// lambdaParser (lambda (args) body) // ((lambda (args) body) (argVals))
function lambdaParser (input, env) { // input = (args) (body)
  if (input[0] !== '(') { return null }

  const parsed = getExpression(input) // parsed[0] = (arg1 arg2...)
  input = parsed[1] // input = (body) // input = (body)) (exp))
  let parsedArgs = parsed[0].slice(1).trim() // parsedArgs = arg1 arg2...)

  const args = []
  while (parsedArgs[0] !== ')') {
    const temp = parsedArgs.split(' ')[0]
    args.push(temp)
    parsedArgs = parsedArgs.slice(temp.length).trim()
  }

  const parcedBody = getExpression(input)
  const body = parcedBody[0]
  input = parcedBody[1]

  // console.log(input)
  const localEnv = Object.create(env)
  function lambdaFunc (...funcArgs) {
    funcArgs.forEach((arg, index) => { localEnv[args[index]] = arg })
    console.log('funcArgs:', funcArgs)
    console.log('localEnv:', localEnv)
    console.log('body:', body)
    console.log('bodyEvalGlob', expressionEval(body, globalEnv))
    console.log('bodyEvalLocal', expressionEval(body, localEnv))
    // return expressionEval(body, localEnv)
    return 'done'
  }
  return lambdaFunc(5)
}

// const input = '((lambda (x) (+ x x)) (* 3 4))' // 24
// const input = '(lambda (x) (+ x x))'
// console.log(main(input))

// special forms
function formParser (op, input, env) {
  if (op === 'if') { return ifParser(input, env) }
  if (op === 'define') { return defineParser(input, env) }
  if (op === 'lambda') { return lambdaParser(input, env) }
  return null
}

// compoundExpEval
function compoundExpEval (input, env) {
  input = input.slice(1).trim()
  if (input[0] === '(') { expressionEval(input, env) }
  const parsedExp = getExpression(input)
  if (parsedExp === null) { return null }
  let op
  [op, input] = [parsedExp[0], parsedExp[1]]
  if (specialForms.includes(op)) {
    return formParser(op, input, env)
  }
  if (env[op] !== undefined) { // if (env[op] !== undefined)
    const parsedArgs = getArgs(input)
    const args = []
    parsedArgs.forEach(arg => { args.push(expressionEval(arg, env)) })
    return env[op](...args)
  }
}

// expressionEval
function expressionEval (expression, env) {
  if (expression[0] === '(') { return compoundExpEval(expression, env) }
  return atomEval(expression, env)
}

// main
function main (input) {
  console.log('Given input:', input, '\n')
  input = input.replaceAll('(', '( ').replaceAll(')', ' )') // * or fix 'atom)' in getExpression()
  return expressionEval(input, globalEnv)
}

const input = '( + x x )'
const localEnv = Object.create(globalEnv)
localEnv.x = 5
console.log('input:', input)
console.log('env:', localEnv)
console.log(expressionEval(input, localEnv))

// const input = '(define x (+ 5 5) (* x x))'
// console.log(main(input))
// console.log(main('x'))

// console.log(Object.keys(globalEnv).includes('#f'))
// ______________________________Math Cases_______________________________
// let input

// input = '-5 '
// console.log(main(input) === -5)

// input = 'pi'
// console.log(main(input) === 3.14)

// input = '-5'
// console.log(main(input) === -5)

// input = '(sqrt (/ 8 2))' // 2
// console.log(main(input) === 2)

// input = '(* (/ 1 2) 3)' // 1.5
// console.log(main(input) === 1.5)

// input = '(+ 1 (+ 2 3))' // 6
// console.log(main(input) === 6)

// input = '( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )' // 22
// console.log(main(input) === 22)

// input = '(+ (+ 1 (- 1 1)) 1)' // 2
// console.log(main(input) === 2)

// input = '(* 5 10)' // 50
// console.log(main(input) === 50)
// _____________________________________if______________________________________

// let input
// input = '( if (> 30 45) (+ 1 1) "failedOutput")'
// console.log(main(input) === '"failedOutput"')

// input = '(if (= 12 12) (+ 78 2) 9)'
// console.log(main(input) === 80)

// input = '(if #f 1 0)'
// console.log(main(input) === 0)

// input = '(if #t "abc" 1)'
// console.log(main(input) === '"abc"')

// ______________________________________________________________________
