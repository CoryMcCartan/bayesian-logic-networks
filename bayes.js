/*
 * BAYESIAN LOGIC NETWORK
 *
 * © 2016.
 */

let bln = function(root) {
    let id_counter = 0;

    let network = [];

    /**
     * A Bayesian event.
     * @typedef {number} BayesianEvent
     */

    /**
     * Creates an event. Event objects are stored inside the library's closure.
     * This function creates an event, stores it, and returns an integer that
     * can be used to reference it. Events may be negated with the bitwise NOT 
     * operator.
     *
     * @param {*} [id] an identifier for the object.  Will be initialized to an
     * internal counter variable if no identifier is provided.
     *
     * Events are unique—two events with the same identifier are not 
     * interchangeable.
     *
     * @returns {BayesianEvent} the constructed event reference.
     *
     * @example
     * <caption>Creating an event, with and without an identifier.</caption>
     * let sunny = EVENT("S");
     * let cloudy = EVENT();
     *
     * @example
     * <caption>Events can also be created by tagging strings.</caption>
     * let sunny = EVENT `S`;
     * let cloudy = EVENT `cloudy`;
     */
    root.EVENT = function(id = id_counter++) {
        // handle if used as string tag
        if (typeof id === "object" && "raw" in id) {
            id = id[0] || id_counter++;
        }

        let event = {
            id,
            probabilities: [],
            depends: [],
        }; 

        let index =  network.push(event) - 1; // push returns new length, last index is one less

        if (root._BAYES_GLOBAL_VARS)
            root[id] = index;

        return index;
    };
        

    /**
     * A probability object.  Can be a simple, joint, or conditional probability.
     *
     * @typedef {object} Probability
     *
     * @property {function} is assign a probability to an event. If called
     * after a call to given(), is() returns the probability object again, for
     * chaining.
     * @property {function} given construct a conditional probability.  If
     * assigning probabilities, given() should be called once for every
     * combination of events and their negations.  given() returns the
     * probability object for chainging.
     *
     * Probabilities can be queried by coercing them to numbers with the +
     * operator.
     */

    /**
     * Create a probability object.
     *
     * @param {BayesianEvent} event the event to calculate the probability of.
     * @param {BayesianEvent} others calculate a joint probability of all the events 
     * passed to the function.
     *
     * @returns {Probability} a probability object.  
     *
     * @example
     * <caption>
     * Assign a simple probability to an event.
     * </caption>
     * P(rain).is(0.2);
     *
     * @example
     * <caption>
     * Assign a conditional probability to an event.
     * </caption>
     * P(sprinkler)
     *     .given(rain).is(0.01)
     *     .given(~rain).is(0.4);
     *
     * @example
     * <caption>
     * Query the probability of an event.
     * </caption>
     * +P(~rain); // 0.8
     * +P(sprinkler); // 0.322
     * +P(sprinkler).given(~rain); // 0.4
     */
    root.P = function(event, ...others) {
        if (typeof event !== "number") 
            throw new TypeError(`Expected an event, but got ${event} instead.`);

        let prob = {
            event: event,
            depends: [],
            probabilities: [],
        };

        // simple or conditional probability
        if (!others.length) {
            prob.is = setProbability.bind(prob, null);
            prob.given = createConditional.bind(prob);
            prob[Symbol.toPrimitive] = () => 
                conditionalProbability([event]);
        } else { // joint probability
            prob[Symbol.toPrimitive] = () => 
                conditionalProbability([event, ...others]);
            prob.given = function(...events) {
                this.depends = events.map(e => e >= 0 ? e : ~e);
                // for chaining
                this.given = undefined;
                this[Symbol.toPrimitive] = () => 
                    conditionalProbability([event, ...others], events);

                return this;
            };
        }

        return prob;
    };

    // helper function to construct a conditional probability object
    let createConditional = function(...events) {
        if (!this.depends.length) {
            // normalize all events and store in dependencies list
            this.depends = events.map(e => e >= 0 ? e : ~e);
        }

        // for chaining
        this.given = undefined;
        this.is = setProbability.bind(this, events);
        this[Symbol.toPrimitive] = () => 
            conditionalProbability([this.event], events);

        return this;
    };

    // helper function to assign probability to simple or conditional
    let setProbability = function(givens, probability) {
        // bounds checking
        if (probability < 0 || probability > 100) {
           throw new RangeError(`Probability ${probability} out of bounds.`); 
        } else if (probability > 1) {
            probability /= 100; // percentage
        }
        
        // handle negation
        if (this.event < 0) {
            this.event = ~this.event;
            probability = 1 - probability;
        }

        if (!givens) { // no conditional, just set probability
            this.probabilities = +probability;
            this.given = undefined;
        } else { // conditional, set prob. in table
            this.probabilities[probIndex(givens)] = +probability;
            this.given = createConditional.bind(this);
        }

        // for chaining
        this.is = undefined;

        return this;
    };

    // calculate the index in the probability table given a set of events
    let probIndex = function(events) {
        // calculate index
        let index = 0;
        let length = events.length;
        for (let i = 0; i < length; i++) {
            // events[i] >= 0 is true if the event is true
            // << i sets the bit in the corresponding position
            index |= (events[i] >= 0) << i; 
        }

        return index;
    };

    /**
     * Register a Bayesian network.
     * @param {BayesianEvent} probs a set of simple or conditional probabilities to
     * save in the network.
     */
    root.facts = function(...probs) {
        // iterate over each fact and add its probabilities to the network;
        for (let prob of probs) {
            if (typeof prob.event !== "number") 
                throw new TypeError(`Expected probability object, but got ${prob}.`);

            let event = network[prob.event];

            if (!event)
                throw new ReferenceError(`Not an event: ${prob.event}`);

            event.probabilities = prob.probabilities;
            event.depends = prob.depends;
        }
    };

    // calculate the probability of a set of events all occuring as specified
    // for example, 'a' AND 'b' AND 'not c'
    let jointProbability = function(...events) {
        let probability = 1;
        let length = events.length;

        for (let i = 0; i < length; i++) {
            let e = events[i];
            let event = network[norm(e)];
            let depends = applyConditions(event.depends, events); // negate vars that needs to be
            probability *= getProbability(e, depends);
        }

        return probability;
    };

    // dependencies are stored without negations, but the events provided to 
    // jointProbability might be negated. Copy over the negations from events
    // onto dependencies
    let applyConditions = function(depends, events) {
        // if any of the events are negated, negate the corresponding dependency
        return depends.map(d => events.includes(~d) ? ~d : d);
    };

    // calculate the probability of an event occuring given a set of other events
    // either ocurring or not occurring
    let conditionalProbability = function(events, dependencies = []) {
        if (perfectMatch(events[0], dependencies)) // if exactly specified
            return getProbability(events[0], dependencies);

        let nuisance = nuisanceVariables(...events, ...dependencies);

        // sum over all unbound variables
        let p_joint = 0;
        for (let combination of nuisanceIterate(dependencies, nuisance)) {
            p_joint += jointProbability(...events, ...combination);
        }

        // sum over all unbound variables, and all possible values of the event itself
        let p_depends = 0;
        // unbind the target event
        nuisance.push(...events);
        for (let combination of nuisanceIterate(dependencies, nuisance)) {
            p_depends += jointProbability(...combination);
        }

        // bayes' rule
        return p_joint / p_depends;
    };

    // a generator to yield all possible combinations of unbound nuisance variables
    let nuisanceIterate = function * (depends, nuisance) {
        let length = nuisance.length;
        // for every combination
        for (let i = 0; i < (1 << length); i++) {
            // start with all dependencies
            let combination = depends.slice();
            // add in right negations of nuisance values
            for (let n = 0; n < length; n++) {
                let param = nuisance[n];
                // negate if need to
                if (!((i >> n) & 1)) // checks bit: shift over to correct position and check if is 1
                    param = ~param;

                combination.push(param);
            }

            yield combination;
        }
    }

    // find which events are dependencies but aren't specified, and so are
    // unbound nuisance variables
    let nuisanceVariables = function(...events) {
        let processed = events.map(norm);

        // find which events aren't in dependencies
        return [...network.keys()].filter(d => !processed.includes(d));
    };

    let perfectMatch = function(event, dependencies) {
        let depends = network[norm(event)].depends;
        // if not right length, no hope
        if (depends.length !== dependencies.length) return false;
        // make sure both are identical
        return dependencies.reduce((p, c, i) => p && depends[i] === c, true);
    };

    // look up the probability of an event with fully bound dependencies
    let getProbability = function(event, dependencies) {
        let i = norm(event);
        let probability;

        if (dependencies.length === 0)
            probability = network[i].probabilities;
        else
            probability = network[i].probabilities[probIndex(dependencies)];

        // catch missing data
        if (isNaN(probability) || probability === undefined || probability.length === 0)
            throw new ReferenceError(`Expected value for P(${getName(event)}|` + 
                            `${dependencies.map(getName).join(",")})`);

        // handle negation
        if (event < 0)
            return 1 - probability;
        else
            return probability;
    };

    // helper function to normalize events that may be negated
    let norm = e => (e >= 0) ? e : ~e;

    // helper function for printing names
    let getName = function(e) {
        if (e >= 0) 
            return network[e].id;
        else
            return "!" + network[norm(e)].id;
    };


    if (root._BAYES_TESTING) {
        root._network = network;
        root._conditionalProbability = conditionalProbability;
        root._reset = function() {
            id_counter = 0;
            network = [];
            root._network = network;
        };
    }

    root.bayes = {
        version: "1.0.0"
    };

}

if (typeof module === "undefined")
    bln(this);
else
    module.exports = function(scope) {
        bln(scope);
    };
