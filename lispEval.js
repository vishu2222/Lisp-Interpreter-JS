
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

function getArgs (input) { // input = (exp) (exp) ...(exp)) // '1 (+ 2 3))'
  // console.log(input, 'in get args 1')
  const args = []
  if (input[0] === '(') {
    args.push(expressionEval(input))
  }
  while (input[0] !== '(' && input[0] !== ')') { // to get atom args after an operation inside current expression and before the beginning of another expresion
    const parsed = atomParser(input) // [ 1, ' ( + 2 3 ) )' ]
    if (parsed) {
      // console.log(parsed, '...in parsed of getArgs')
      args.push(parsed[0])
      input = parsed[1].trim() // input = '( + 2 3 ) )'
    } else { return null }
  }
  if (input[0] === '(') {
    args.push(expressionEval(input))
  }
  return args
}

function expressionEval (input) {
  input = input.replaceAll('(', '( ').replaceAll(')', ' )') // input = (func (exp) (exp) ...) // '(+ 1 (+ 2 3))'
  if (input[0] !== '(') { return null }
  input = input.slice(1).trim() // remove ( and trim spaces // input = func (exp) (exp) ...) // '+ 1 (+ 2 3))'
  const func = input.split(/\s/)[0] // func is an operation in env // func = +
  if (!Object.keys(env).includes(func)) { return null } // if func doesnt belong to env return null
  input = input.slice(func.length).trim() // rest of the input after removing func part // input = (exp) (exp) ...) // input = 1 (+ 2 3))
  const args = getArgs(input) // getArgs('(exp) (exp) ...)') = [exp1Val, exp2Val ...] // args('1 (+ 2 3))')
  return env[func](args) // func([exp1Val, exp2Val ...])
}

function evaluate (input) {
  if (input[0] !== '(') { return null }
  return expressionEval(input)
}

const input = '(+ (+ 1 1) 1)'
// const input = '(+ 1 (+ 2 3))'
// const input = '( + ( + ( + 9 (+ 2 2)) 2) ( + 3 4) )'
console.log('......', input, '......')
console.log(evaluate(input))
