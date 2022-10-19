
let globalEnv = {
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
function numberEval (num) { // add validation for num
  if (Number(num) === null || isNaN(Number(num))) { return null }
  return Number(num)
}

// symbolEval
function symbolEval (atom, env) { // add validation for symbol
  if (Object.keys(Object.getPrototypeOf(env)).includes(atom)) { return env[atom] }
  if (Object.keys(env).includes(atom)) { return env[atom] }
  return null
}

// stringParser
function stringEval (input) {
  const mached = input.match(/".+"/) // [\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*
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

// special forms
function formParser (op, input, env) {
  if (op === 'if') { return ifParser(input, env) }
  if (op === 'define') { return defineParser(input, env) }
  return null
}

// defineParser // (define <variable> <expression>)
function defineParser (input, env) {
  let parsedExpression = getExpression(input)
  const variable = parsedExpression[0]
  input = parsedExpression[1]

  parsedExpression = getExpression(input)
  const expression = parsedExpression[0]
  input = parsedExpression[1]

  const localEnv = Object.create(globalEnv)
  localEnv[variable] = expressionEval(expression, env)

  globalEnv = localEnv
  return `${variable} = ${localEnv[variable]}`
}

// compoundExpEval
function compoundExpEval (input, env) {
  input = input.slice(1)
  const parsedExp = getExpression(input)
  if (parsedExp === null) { return null }
  let op
  [op, input] = [parsedExp[0], parsedExp[1]]
  if (specialForms.includes(op)) {
    return formParser(op, input, env)
  }
  if (Object.keys(env).includes(op)) {
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
  input = input.replaceAll('(', '( ').replaceAll(')', ' )') // * fix 'atom)' in getExpression()
  return expressionEval(input, globalEnv)
}

const input = '(define x (+ 5 5) (* x x))'
console.log(main(input))
console.log(main('x'))

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
