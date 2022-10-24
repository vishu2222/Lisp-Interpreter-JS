
const globalEnv = { // ignored arg validations in globalEnv
  '+': (...args) => args.reduce((sum, i) => sum + i),
  '-': (...args) => args.reduce((sum, i) => sum - i),
  '*': (...args) => args.reduce((mul, i) => mul * i, 1),
  '/': (...args) => { if (args.length === 2) { return args[0] / args[1] } console.log('Expected 2 args'); return null },
  '>': (...args) => { if (args.length === 2) { return args[0] > args[1] } console.log('Expected 2 args'); return null },
  '<': (...args) => { if (args.length === 2) { return args[0] < args[1] } console.log('Expected 2 args'); return null },
  '>=': (...args) => { if (args.length === 2) { return args[0] >= args[1] } console.log('Expected 2 args'); return null },
  '<=': (...args) => { if (args.length === 2) { return args[0] <= args[1] } console.log('Expected 2 args'); return null },
  '=': (...args) => { if (args.length === 2) { return args[0] === args[1] } console.log('Expected 2 args'); return null },
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
function numberEval (atom) { // ignored number validation
  if (isNaN(Number(atom))) { return null }
  return Number(atom)
}

// symbolEval
function symbolEval (atom, env) { // ignored symbol validation
  if (env[atom] === undefined) { return null }
  return env[atom]
}

// stringEval
function stringEval (atom) {
  const mached = atom.match(/".*"/) // ignored string validation  [\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*
  if (mached) { return mached[0].trim() }
  return null
}

// atomEval
function atomEval (atom, env) {
  if (atom[0] === '\'') { return atom.slice(1) } // 'a -> a
  if (numberEval(atom) === 0) { return 0 }
  if (symbolEval(atom, env) === false) { return false }
  return numberEval(atom) || symbolEval(atom, env) || stringEval(atom)
}

// parseAtomOrExp // consumes an input and returns first atom or expression
function parseAtomOrExp (input) {
  input = input.trim()
  if (input[0] !== '(') {
    const atom = input.split(' ')[0]
    return [atom, input.slice(atom.length).trim()]
  }
  let str = input.slice(1) // input = (...) ) // expression = ...) )
  let braceCount = 1
  let iterCount = 0
  while (braceCount !== 0) {
    iterCount++
    if (iterCount > input.length) { return null }
    if (str[0] === '(') {
      braceCount++
      str = str.slice(1)
    } else if (str[0] === ')') {
      braceCount--
      str = str.slice(1)
    } else {
      str = str.slice(1)
    }
  }
  return [input.slice(0, input.length - str.length).trim(), str.trim()]
}

// getArgs // returns all arguments in input {inp = arg1, arg2, ...)} occuring before an unmatched )
function getArgs (input) { // input = arg1, arg2, ...)
  const argsArr = []
  while (input[0] !== ')') {
    const parsed = parseAtomOrExp(input)
    argsArr.push(parsed[0])
    input = parsed[1]
  }
  return argsArr
}

// ifParser (if <test> <consequent> <alternate>)
function ifParser (input, env) { // input = test consequent alternate )
  let parsed = parseAtomOrExp(input)
  const testArg = parsed[0]
  input = parsed[1]

  parsed = parseAtomOrExp(input)
  const passArg = parsed[0]
  input = parsed[1]

  parsed = parseAtomOrExp(input)
  const failArg = parsed[0]
  input = parsed[1]

  if (input.trim().slice(1).length > 0) { console.log('error: too many operands'); return null }
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

  if (input.slice(1).length > 0) { console.log('expected one argument'); return null }
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
  return lambdaFunc
}

// (quote <datum>)  // input = ...)
const quoteParser = (input) => input.slice(0, input.length - 1).trim()

// set (set! symbol exp)
function setParser (input, env) {
  const parsed = parseAtomOrExp(input)
  const [symbol, expression] = [parsed[0], parsed[1]]
  if (env[symbol] === undefined) { console.log('can\'t set undefined variable'); return null }
  env[symbol] = expressionEval(parseAtomOrExp(expression)[0], env)
  return `${symbol} Set`
}

// special forms
function formParser (op, input, env) {
  if (op === 'if') { return ifParser(input, env) }
  if (op === 'define') { return defineParser(input, env) }
  if (op === 'lambda') { return lambdaParser(input, env) }
  if (op === 'quote') { return quoteParser(input) }
  if (op === 'set!') { return setParser(input, env) }
}

// compoundExpEval // evaluates a expression enclosed in braces
function compoundExpEval (compExp, env) { // input = '(op arg1 arg2)'
  compExp = compExp.slice(1).trim() // op arg1 arg2)
  const OpArgs = parseAtomOrExp(compExp)
  if (OpArgs === null) { return null }
  let [op, args] = [OpArgs[0], OpArgs[1]]
  if (specialForms.includes(op)) { return formParser(op, args, env) }
  const argsArr = getArgs(args).map(arg => expressionEval(arg, env))
  if (env[op] !== undefined) { return env[op](...argsArr) }
  if (op[0] === '(') {
    op = expressionEval(op, env)
    return op(...argsArr)
  }
}

// expressionEval // call atomEval if input = identifier and compoundExpEval if input = '(...)'
function expressionEval (expression, env) {
  if (expression[0] === '(') { return compoundExpEval(expression, env) }
  return atomEval(expression, env)
}

// main
function main (input) {
  input = input.replaceAll(')', ' )')
  // console.log('given input', input)
  return expressionEval(input, globalEnv)
}

module.exports = main
