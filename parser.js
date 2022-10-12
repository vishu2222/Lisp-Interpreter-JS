const env = {
  '+': (arr) => arr.reduce((sum, i) => sum + i, 0)
}

function atomParser (input) {
  const output = input.match(/^-?([1-9]\d*|0)(\.\d+)?([eE][+-]?\d+)?/) // need to extend to complex range, a/b form , +|- nan.0, +|-inf.0
  if (output) { return [Number(output[0]), input.slice(output[0].length)] }
  return null
}

function evaluate (input) {
  console.log(input, 'eval a')
  input = input.trim()
  if (input[0] !== '(') { return null } // lisp expression starts with '('
  input = input.slice(1).trim() // remove '('
  console.log(input, 'eval b')
  const func = input.split(/\s/)[0] // func = operation after '('
  if (func === null) { return null } // no arguments found after func
  console.log(func, 'func')
  input = input.slice(func.length).trim() // input = rest of the sting
  console.log(input, 'eval c')
  if (Object.keys(env).includes(func)) { // if func is an env operation then parse the subsequent agruments
    const args = getArgs(input)
    if (args === null || args.length < 2) { return null } // no ot not enough args
    return env[func](args)
  }
}

function getArgs (input) {
  console.log(input, 'getArgs a') // a
  const args = []
  if (input[0] === '(') { // if arg is a list
    args.push(evaluate(input))
    console.log(args, 'getArgs b') // b
  }
  if (input[0] !== '(') { // ?
    // input = input.trim()
    while (input[0] !== ')') { // if arg is not a list it should be an atom or ?
      const parsed = atomParser(input)
      console.log(parsed, 'getArgs c') // c
      if (parsed) { // i.e if return val of atomParser is not null or not undefined
        args.push(parsed[0])
        console.log('args update d', args) // d
        input = parsed[1].trim()
        console.log(input, 'getArgs e') // e
        if (input[0] === '(') { args.push(evaluate(input)) }
        console.log(input, 'getArgs f') // f
      } else { console.log(input[0], 'getArgs G'); return null } // unable to parse atoms // add other parsers
    }
    return args
  }
}

// let input = '(+ 1 2 3 4)'
// let input = '(+ (+ 2 (+ 2 1)) (+ 2 2))' // 9
let input = '(+ 1 (+ 2 3))'
input = input.replaceAll('(', '( ').replaceAll(')', ' )')
console.log(input, 'input')
console.log(evaluate(input))
