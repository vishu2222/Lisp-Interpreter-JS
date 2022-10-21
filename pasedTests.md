// let input

// input = '-5 '
// console.log(main(input) === -5)

// input = 'pi'
// console.log(main(input) === 3.141592653589793)

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
// _____________________________________if_______________________________

// let input
// input = '( if (> 30 45) (+ 1 1) "failedOutput")'
// console.log(main(input) === '"failedOutput"')

// input = '(if (= 12 12) (+ 78 2) 9)'
// console.log(main(input) === 80)

// input = '(if #f 1 0)'
// console.log(main(input) === 0)

// input = '(if #t "abc" 1)'
// console.log(main(input) === '"abc"')

// ____________________________define__________________________________________

// let input

// input = '(define a 90)'
// console.log(main(input))

// input = '(define x (+ 5 5) (* x x))'
// console.log(main(input))

// input = '(define circle-area (lambda (r) (* pi (* r r))))'
// console.log(main(input))
// console.log(main('(circle-area 3)'))

// input = '(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))'
// console.log(main(input))
// console.log(main('(fact 4)'))
// console.log(main('(fact 100)'))
// ____________________________lambda__________________________________________

// let input
// input = '((lambda (x) (+ x x)) (* 3 4))' // 24
// console.log(main(input))

// input = '(lambda (x) (+ x x))'
// console.log(main(input))

// _____________________________________quote____________________________________

// let input

// input = '(quote #(a b c))'
// console.log(main(input))

// input = '(quote (+ 1 2)) '
// console.log(main(input))

//  _____________________________________set!____________________________________

// main('(define r 1)')
// const input = '(set! r 10)'
// main(input)
// console.log(main('(+ r r )'))

// ____________________________nested lambda______________________________________

// const input = '(define rectangleArea (lambda (length) (lambda (bredth) (* length bredth))))'
// console.log(main(input))
// console.log(main('(define areaLen2 (rectangleArea 2))'))
// console.log(main('(areaLen2 3)'))
