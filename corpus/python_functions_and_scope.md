# Python Functions and Scope

## What is a Function?

A function is a reusable block of code that performs a specific task. Functions help you avoid repeating yourself (DRY -- Don't Repeat Yourself) and make your code easier to read and test.

```python
def greet(name):
    return f"Hello, {name}!"

result = greet("Sam")
print(result)  # Hello, Sam!
```

## Parameters vs Arguments

- **Parameter**: the variable in the function definition (`name` above)
- **Argument**: the actual value you pass when calling the function (`"Sam"` above)

## Default Parameters

You can give parameters a default value so they're optional:

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Sam")              # Hello, Sam!
greet("Sam", "Howdy")    # Howdy, Sam!
```

## Return Values

A function can return a value with `return`. Without it, it returns `None`.

```python
def add(a, b):
    return a + b

def print_sum(a, b):
    print(a + b)
    # implicitly returns None

x = add(3, 4)        # x = 7
y = print_sum(3, 4)  # prints 7, y = None
```

## Scope

Scope determines where a variable is accessible.

- **Local scope**: variables defined inside a function, only accessible there
- **Global scope**: variables defined outside any function, accessible everywhere

```python
x = 10  # global

def my_func():
    x = 20  # local -- different variable, doesn't affect global x
    print(x)  # 20

my_func()
print(x)  # 10
```

## The LEGB Rule

Python looks up variables in this order:
1. **L**ocal -- inside the current function
2. **E**nclosing -- in enclosing functions (for nested functions)
3. **G**lobal -- at the module level
4. **B**uilt-in -- Python's built-in names (`len`, `print`, etc.)

## Recursion

A function can call itself. This is called recursion. Every recursive function needs:
1. A **base case** that stops the recursion
2. A **recursive case** that moves toward the base case

```python
def factorial(n):
    if n == 0:        # base case
        return 1
    return n * factorial(n - 1)  # recursive case

factorial(5)  # 5 * 4 * 3 * 2 * 1 = 120
```

Without a base case, recursion runs forever and causes a `RecursionError`.

## Common Mistakes

- Forgetting `return` and wondering why you got `None`
- Modifying a global variable inside a function without `global` keyword
- Infinite recursion (missing or unreachable base case)
- Mutable default arguments (use `None` instead of `[]` as a default)

```python
# BAD -- the list persists between calls
def append_item(item, lst=[]):
    lst.append(item)
    return lst

# GOOD
def append_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```
