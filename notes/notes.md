
### [Scheme languages](http://norvig.com/lispy.html)
* Atomic expressions 
    1) numbers eg: 1, 5.2
    2) symbols eg: Ab, hello
* No distinction between statements and expressions. +, -, < etc are not operations but symbols
* Scheme languages consists of lists and expresions. (expressionInsideList), (+ 2 3) , (if (> 2 3) 1 0)
* There are only 5 keywords and 8 syntactic forms.

#### Typical scheme program structure
* (keyWord expression1 expression2 expression3 .....)
* each espression can be a list.

#### Allowed expressions
* symbol
* Number (integer or float)
* conditional (if testCondition trueResult falseResult)
* definition (define symbol expression) ex: (define pie 3.14)
* procedureCall (func arg1 arg2...) if func is not define or if then its a procesureCall ex: (sqrt (+ 6 3))

### Parsing
* starts with '(' and ends with ')'
* tokens in between are numbers or symbols (atoms)
* ; is used for comments
* +-*/ basic numeric operations
* expressions are case insensitive
* numbers, t, nil return themselves
* symbols consists of any Alpha numberic characters except )',(";|:
* the exception chars can occur with an escape \
* ' stops evaluation


### https://lisp-lang.org/learn/first-steps
