# E

Creates an event. Event objects are stored inside the library's closure.
This function creates an event, stores it, and returns an integer that
can be used to reference it. Events may be negated with the bitwise NOT 
operator.

**Parameters**

-   `id` **Any=** an identifier for the object.  Will be initialized to an
    internal counter variable if no identifier is provided.Events are unique—two events with the same identifier are not 
    interchangeable.

**Examples**

_Creating an event, with and without an identifier._

```javascript
let sunny = E("S");
let cloudy = E();
```

_Events can also be created by tagging strings._

```javascript
let sunny = E`S`;
let cloudy = E`cloudy`;
```

Returns **[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)** the constructed event reference.

# facts

Register a Bayesian network.

**Parameters**

-   `probs` **[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)** a set of simple or conditional probabilities to
    save in the network.

# P

**Parameters**

-   `event`  
-   `others` **...** 

**Properties**

-   `is` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** assign a probability to an event. If called
    after a call to given(), is() returns the probability object again, for
    chaining.
-   `given` **[function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** construct a conditional probability.  If
    assigning probabilities, given() should be called once for every
    combination of events and their negations.  given() returns the
    probability object for chainging.Probabilities can be queried by coercing them to numbers with the +
    operator.

# P

Create a probability object.

**Parameters**

-   `event` **[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)** the event to calculate the probability of.
-   `others` **[Event](https://developer.mozilla.org/en-US/docs/Web/API/Event)** calculate a joint probability of all the events 
    passed to the function.

**Examples**

_Assign a simple probability to an event._

```javascript
P(rain).is(0.2);
```

_Assign a conditional probability to an event._

```javascript
P(sprinkler)
    .given(rain).is(0.01)
    .given(~rain).is(0.4);
```

_Query the probability of an event._

```javascript
+P(~rain); // 0.8
+P(sprinkler); // 0.322
+P(sprinkler).given(~rain); // 0.4
```

Returns **Probability** a probability object.
