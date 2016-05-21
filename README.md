# bln.js
## Bayesian Logic Networks

BLN is an ES6 library for bayesian logic network calculations.  It allows you to 
construct logic networks and query them for probabilities.

## Installation
 
- Bower: `bower install bln`

Or you can download `bayes.js` above.

## Basic Usage

### Events

BLN works with *events* and *probabilities*.  Events can have an outome that is
either true or false, like `is_sunny` or `has_disease`. Events are stored in a 
centralized database—all the constructor returns is a reference to the event 
object.  Events are created using the `EVENT()` function, which can also be 
called as a string tagger.  The function accepts an optional ID parameter.
```javascript
let is_sunny = EVENT("is sunny");
let has_disease = EVENT `has disease`;
let earthquake = EVENT();
```
If you're only working in the global scope, you can also have BLN automatically
add variables to the global object:
```
_BAYES_GLOBAL_VARS = true;

EVENT `is_sunny`;
EVENT `has_disease`;
```

Events can be negated by using the bitwise negation operator: `~`.  So we can do:
```javascript
let is_cloudy = ~is_sunny;
let healthy = ~has_disease;
```

### Probabilities

Probabilities represent the chances of an event occuring.  They can be both set
and queried.  Probabilities come in three types: simple, conditional, and joint.
A simple probability does not depend on other events, like `P(earthquake)`. A
conditional probability does depend on the outcome of other events, like 
`P(grass_wet).given(is_raining)`. A joint probability represents the chances
of a series of events all occuring together, like `P(earthquake, thunderstorm)`.

Known probabilities are set by using the `is()` and `given()` methods attached
to the probability object.  Constructed probabilities are passed to the `facts()`
function so that they can be stored in a central database.  
```javascript
facts(
    P(earthquake).is(0.05),

    P(raining).is(0.2),
    P(grass_wet)
        .given(raining).is(0.9)
        .given(~raining).is(0.05),
 );
```
Simple probabilities are assigned with a call to `is()`.  The function takes the 
probability as a decimal, or as a percentage greater than 1.  So we could have
done `P(earthquake).is(5)`.

Conditional probabilities are assigned with the `given()` function.  It is the 
responsibility of the caller to make sure that every possibile combination of an
event's dependencies have been listed and assigned a probability.  For example,
the following would lead to an error later, when probabilities are calculated, 
because the probability of wet grass in the event of no rain is not specified:
```javascript
P(grass_wet)
    .given(raining).is(0.9)
```
If an event has more than one dependency, they are all listed in combination:
```javascript
P(sprinkler)
    .given(raining).is(0.1)
    .given(~raining).is(0.4),
P(grass_wet)
    .given(sprinkler, raining).is(0.99)
    .given(sprinkler, ~raining).is(0.85)
    .given(~sprinkler, raining).is(0.9)
    .given(~sprinkler, ~raining).is(0.05),
```

Probabilities are queried by coercing them to numbers using the `+` operator.
The use of conditional probabilities and negation is as before.
```javascript
+P(earthquake); // 0.05
+P(earthquake).given(raining); // 0.05 

+P(grass_wet).given(~sprinkler, raining); // 0.9
+P(~grass_wet); // 0.5222
+P(raining).given(grass_wet); // 0.3804939...

+P(grass_wet, sprinkler); // 0.2918
+P(grass_wet, sprinkler).given(rain); // 0.099
```

## More Information

More detailed information about functions and types can be found in the
[API](API.md)
