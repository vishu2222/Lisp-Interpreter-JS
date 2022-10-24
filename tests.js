const main = require('./lispEval')

// ______________________________Math Cases_______________________________
console.log('Math')
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
console.log('If')
console.log(main('( if (> 30 45) (+ 1 1) "failedOutput")') === '"failedOutput"')
console.log(main('(if (= 12 12) (+ 78 2) 9)') === 80)
console.log(main('(if #f 1 0)') === 0)
console.log(main('(if #t "abc" 1)') === '"abc"')

// ____________________________define____________________________________
console.log('Define')
main('(define a 90)')
main('(define x (+ 5 5))')
main('(define circle-area (lambda (r) (* pi (* r r))))')
console.log(main('(circle-area 3)') === 28.274333882308138)
main('(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))')
console.log(main('(fact 4)') === 24)
console.log(main('(fact 10)') === 3628800)

// ____________________________lambda and higher order functions_____________
console.log('Lambda')
console.log(main('((lambda (x) (+ x x)) (* 3 4))') === 24)
console.log(typeof (main('(lambda (x) (+ x x))')) === 'function')

main('(define x 4)')
console.log(main('((lambda (y) (+ y x)) 5)') === 9)

main('(define twice (lambda (x) (* 2 x)))')
console.log(main('(twice 5)') === 10)

main('(define repeat (lambda (f) (lambda (x) (f (f x)))))')
console.log(main('((repeat twice) 10)') === 40)

// _____________________________________quote____________________________________
console.log('Quote')
console.log(main('(quote (a b c))') === '(a b c )')
console.log(main('(quote (+ 1 2)) ') === '(+ 1 2 )')

//  _____________________________________set!____________________________________
console.log('Set!')
main('(define r 1)')
main('(set! r 10)')
console.log(main('(+ r r )') === 20)

// ____________________________nested lambda(closures)______________________________________
console.log('Nested lambda')
main('(define rectangleArea (lambda (length) (lambda (bredth) (* length bredth))))')
main('(define areaLen2 (rectangleArea 2))')
console.log(main('(areaLen2 3)') === 6)

// _____________________________lists__________________________________________
console.log('Lists')
console.log(main('(list 1 2 3 4)'))
console.log(main('(list \'a \'b \'c)'))
console.log(main('(define a (list 1 2 3 4))'))
console.log(main('a'))
console.log(main('(list \'a (+ 3 4) \'c)'))
console.log(main('(quote ("this" "is" "a" "list"))'))

// _________________________begin__________________________________________

console.log('Begin')
console.log(main('(begin (define r 10) (* pi (* r r)))'))

// ___________________________to pass____________________________
// console.log(main('- 1'))
// console.log(main('(list \'(a b c))')) // doesnt support quote form '()
