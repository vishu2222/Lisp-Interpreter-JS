
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
  '#t': true,
  '#f': false,
  true: true,
  false: false,
  sqrt: (a) => Math.sqrt(a),
  abs: (a) => Math.abs(a),
  pi: 3.14
}

// numberEval
function numberEval (input, env) {
  const mached = input.match(/^[-+]?([1-9]\d*|0)(\.\d+)?([eE][+-]?\d+)?/) // need to extend to complex range, a/b form , +|- nan.0, +|-inf.0
  if (mached) { return [Number(mached[0]), input.slice(mached[0].length).trim()] }
  return null
}

// stringParser
function stringParser (input) {
  const mached = input.match(/^"[\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*"\s/)
  if (mached) { return [mached[0].trim(), input.slice(mached[0].length).trim()] }
  return null
}

// symbolEval
function symbolEval (input, env) {
  const mached = input.match(/^[\w!$%&*/:<=?>~_^+-/*#]+[\w\d]*\s/) // need to verify for all cases
  if (mached === null) { return null }
  let symbol = mached[0]
  input = input.slice(symbol.length).trim()
  symbol = symbol.trim()
  if (Object.keys(env).includes(symbol)) { return [env[symbol], input.trim()] }
  if (Object.keys(Object.getPrototypeOf(env)).includes(symbol)) { return [env[symbol], input.trim()] }
  return null
}

// atomEval
function atomEval (input, env) {
  return numberEval(input, env) || symbolEval(input, env) // an atom is a number or symbol
}

// get ListArg
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
  return [input.slice(0, input.length - str.length).trim(), str.trim()] // returns [listArg, rest of the string] // change to returning evaluated exp?
}

// get args
function getArgs (input, env) { // input = arg1, arg2,..) args are either atom or list expressions
  const args = []
  while (input[0] !== ')') { // i.e is while the last ')' in the input is not reached
    if (input[0] === '(') { // if the arg is a list expression
      const ParsedList = getListArg(input) //
      if (ParsedList === null) { return null }
      input = ParsedList[1]
      const arg = expressionEval(ParsedList[0], env)
      if (arg === null) { return null }
      args.push(arg)
    } else { // get atom expression
      const parsed = atomEval(input, env)
      if (parsed === null) { return null }
      args.push(parsed[0])
      input = parsed[1]
    }
  }
  return args
}

// booleanParser
function booleanEval (input, env) { // anything that is not false or #f is true in scheme
  if (input[0] !== '(') {
    // console.log(input)
    const temp = atomEval(input, env)
    return [temp[0], temp[1]]
  }
  if (input[0] === '(') {
    const temp = getListArg(input)
    const testArg = temp[0]
    input = temp[1].trim()
    const parsed = expressionEval(testArg, env)
    if (parsed === false) { return [false, input] }
    else { return [true, input] }
  }
  console.log('invalid test consdition in if')
  return null
}

// ifParser // (if <test> <consequent> <alternate>)
function ifParser (input, env) { // testCondition passCase failCase)
  let parsed = booleanEval(input, env)
  if (parsed === null) { console.log('can\'t parse testCondition'); return null }
  const testCondition = parsed[0]
  input = parsed[1].trim()

  parsed = getListArg(input) || atomEval(input, env) || stringParser(input)
  if (parsed === null) { return null }
  const passCase = parsed[0]
  input = parsed[1]

  parsed = getListArg(input) || atomEval(input, env) || stringParser(input)
  if (parsed === null) { return null }
  const failCase = parsed[0]
  input = parsed[1]

  // console.log('TC', testCondition, 'PC', passCase, 'FC', failCase)
  if (testCondition === false || testCondition === '#f') { //  || testCondition === '#f'
    if (failCase[0] === '(') { return [expressionEval(failCase, env), input] }
    return [failCase, input]
  }

  if (passCase[0] === '(') { return [expressionEval(passCase, env), input] }
  return [passCase, input]
}

// defineParser // (define <variable> <expression>)
// function defineParser (input, env) {
//   // console.log('define parser 1...', input)
//   let parsed = symbolParser(input)
//   if (parsed === null) { console.log('cannot parse symbol in define parser'); return null }
//   const key = parsed[0]
//   input = parsed[1]

//   if (input[0] === '(') {
//     const parsed = getListArg(input)
//     if (parsed === null) { console.log('cannot parse listArg in define parser'); return null }
//     input = parsed[1]
//     env[key] = expressionEval(parsed[0])
//   } else {
//     parsed = symbolParser(input)
//     if (parsed === null) { console.log('cannot parse atom in define parser'); return null }
//     env[key] = parsed[0]
//     input = parsed[1].trim()
//   }
//   // console.log('...define', input, env)
//   return input
// }

// lambdaParser (lambda (symbol...) (body))
function lambdaParser (input, env) { // input = (args) (body)
  if (input[0] !== '(') { return null } // after lambda we should have (arg1, arg2...)
  const parsed = getListArg(input) // parsed[0] = (args)
  input = parsed[1] // input = (body)
  let parsedArgs = parsed[0].slice(1).trim() // parsedArgs = arg1 arg2...)
  const args = []
  while (parsedArgs[0] !== ')') {
    const temp = parsedArgs.split(' ')[0]
    args.push(temp)
    parsedArgs = parsedArgs.slice(temp.length).trim()
  }

  const parcedBody = getListArg(input)
  const body = parcedBody[0]
  input = parcedBody[1]
  console.log(input, 'body:', body)

  args.forEach(arg => { env[arg] = null })

  function lambdafunc (...args) {
    return expressionEval(body, env)
  }
  return [lambdafunc, input]
  // env[procedure] = (...args) => body
  // console.log('args:', args, ', input:', input, 'env:', env[procedure])
}

// special forms
function formParser (op, input, env) {
  if (op === 'if') { return ifParser(input, env) }
  // if (op === 'define') { return defineParser(input, env) }
  if (op === 'lambda') { return lambdaParser(input, env) }
  // if (op === 'quote') { return null }
  // return procedureParser(op, input, env)
}

const specialForms = ['if', 'define', 'quote', 'lambda']
// expressionEval
function expressionEval (input, env) { // input = (op arg1 arg2 ...) arg is an atom or expression
  input = input.slice(1).trim() // input = op arg1 arg2 ...)
  let op = input.split(' ')[0].trim() // case op starts with '('?
  if (specialForms.includes(op)) { // should have a return or below should go to else
    input = input.slice(op.length).trim()
    const result = formParser(op, input, env)
    if (result === null) { console.log('formParser returns null'); return null }
    const output = result[0]
    input = result[1]
    return output
  }
  const parsed = symbolEval(input, env)
  if (parsed === null) { console.log('err: parsed=null in expEval'); return null }
  [op, input] = [parsed[0], parsed[1]] // input = arg1, arg2,...)
  const args = getArgs(input, env) // getArgs('(arg1 arg2...)') = [arg1Val, arg2Val ...] // input = arg1, arg2,...)

  if (args === null) { console.log('args=null in expEval'); return null }
  return op(...args) // op([exp1Val, exp2Val ...])
}

// evaluate input
function evaluate (input) {
  if (input === null) { return null }
  input = input.replaceAll('(', '( ').replaceAll(')', ' )') // *
  console.log('Given input:', input, '\n')
  if (input[0] !== '(') { return null } // *
  const env = Object.create(globalEnv)
  return expressionEval(input, env)
}

// const input = '(lambda (a b) (* pi (* b a)))'
// // const input = '((lambda (x) (+ x x)) 4)'
// // const input = '(lambda (x) (+ x x))'
// console.log(evaluate(input))
// _____________________________________tests____________________________________________

// // Math

// let input = '(+ (+ 1 (- 1 1)) 2)' // 3
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
// let input
// input = '( if (> 30 45) (+ 1 1) "failedOutput")'
// console.log(evaluate(input) === '"failedOutput"')

// input = '(if (= 12 12) (+ 78 2) 9)'
// console.log(evaluate(input) === 80)

// input = '(if #f 1 0)'
// console.log(evaluate(input) === 0)

// input = '(if #t "abc" 1)'
// console.log(evaluate(input) === '"abc"')

// // ________________________________lambda_________________________________________________

// input = '(lambda (x) (+ x x)) 4) '
// console.log(evaluate(input))

// const input = '(lambda (a,b) (* pi (* b a))'
// console.log(evaluate(input))

// let op case if op is an expression
// if (input[0] === '(') {
//   const parsed = getListArg(input)
//   op = expressionEval(parsed[0])
//   input = parsed[1]
// } else { } // following
