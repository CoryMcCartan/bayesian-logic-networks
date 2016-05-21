var should = chai.should();

describe("EVENT()", function() {
    beforeEach(_reset);

    it("should create a term and return a number", function() {
        let e = EVENT("event");

        e.should.be.a.number;
        _network[0].should.be.an.object;
        _network[0].id.should.equal("event");
    });
    it("should accept any primitive type as an identifier", function() {
        let sym = Symbol("1");

        let e1 = EVENT(1);
        let e2 = EVENT("1");
        let e3 = EVENT(sym);

        _network[0].id.should.equal(1);
        _network[1].id.should.equal("1");
        _network[2].id.should.satisfy((t) => t[Symbol.toPrimitive]() === sym);
    });
    it("should work as a string tag", function() {
        let e = EVENT `event`;

        e.should.be.a.number;
        _network[0].should.be.an.object;
        _network[0].id.should.equal("event");
    });
    it("should register globally if global flag is set", function() {
        _BAYES_GLOBAL_VARS = true; 
        EVENT `_ev1`;
        window._ev1.should.be.a.number;
        _network[0].should.be.an.object;
        _network[0].id.should.equal("_ev1");

        _BAYES_GLOBAL_VARS = false; 
        EVENT `_ev2`;
        should.not.exist(window._ev2);
        _network.should.have.length(2);
    });
});

describe("P()", function() {
    beforeEach(_reset);

    it("should take a single event and return a probability object", function() {
        let e = EVENT();

        let p = P(e);

        p.event.should.equal(e);
        p.depends.should.deep.equal([])
        p.probabilities.should.deep.equal([])

        p.is.should.be.a.function;
        p.given.should.be.a.function;
    });
    it("should take multiple events and return a probability object", function() {
        let e = EVENT();
        let e2 = EVENT();

        let p = P(e, e2);

        p.event.should.equal(e);
        p.depends.should.deep.equal([])
        p.probabilities.should.deep.equal([])

        p.should.not.have.property("is");
        p.should.have.property("given");
    });
    it("should throw an error if a non-number is passed", function() {
        should.Throw(() => {
            P("not a number");
        }, TypeError);  
    });
    
    describe("is()", function() {
        it("should take a number and assign it as a probability", function() {
            let e = EVENT();
            let p = P(e).is(0.5);

            p.probabilities.should.equal(0.5);
            should.not.exist(p.is);
            should.not.exist(p.given);
        });
        it("should take a number between 0 and 100 as a percent", function() {
            let e = EVENT();
            let p = P(e).is(50);

            p.probabilities.should.equal(0.5);
        });
        it("should throw an error for a number less than 0", function() {
            let e = EVENT();

            should.Throw(() => {
                P(e).is(-1);    
            }, RangeError);
        });
    });

    describe("given()", function() {
        it("should take a series of arguments and add them to the dependencies list", function() {
            let e1 = EVENT();
            let e2 = EVENT();
            let e3 = EVENT();

            let p = P(e1).given(e2, e3);

            p.depends.should.deep.equal([e2, e3]);
            should.not.exist(p.given);
            p.is.should.be.a.function;
        });
        it("should normalize negated events", function() {
            let e1 = EVENT();
            let e2 = EVENT();

            let p = P(e1).given(~e2);

            p.depends.should.deep.equal([e2]);
        });

        describe("is()", function() {
            it("should set the conditional probabilities correctly", function() {
                let e1 = EVENT();
                let e2 = EVENT();

                let p = P(e1).given(e2).is(0.1);
                let q = P(e1).given(~e2).is(0.1);

                p.probabilities.should.deep.equal([, 0.1]);
                q.probabilities.should.deep.equal([0.1, ]);
            });
            it("should allow for chaining", function() {
                let e1 = EVENT();
                let e2 = EVENT();

                let p = P(e1).given(e2).is(0.1);

                p.given.should.be.a.function;
                should.not.exist(p.is);

                let q = p.given(~e2).is(0.9);

                q.given.should.be.a.function;
                should.not.exist(q.is);

                q.probabilities.should.deep.equal([0.9, 0.1]);
            });
        });
    });


});

describe("facts()", function() {
    beforeEach(_reset);

    it("should take a series of probability objects and add their data to the network", function() {
        let e1 = EVENT();
        let e2 = EVENT();

        facts(
            P(e2).is(0.5),
            P(e1)
                .given(e2).is(0.1)
                .given(~e2).is(0.9)
        );

        _network[e2].probabilities.should.equal(0.5);
        _network[e2].depends.should.deep.equal([]);
        _network[e1].probabilities.should.deep.equal([0.9, 0.1]);
        _network[e1].depends.should.deep.equal([e2]);
    });
    it("should throw an error if a non-probability object is passed to it", function() {
        should.Throw(() => {
            facts(42);
        }, TypeError);
    });
    it("should throw an error if a non-event is used", function() {
        should.Throw(() => {
            facts(
                P(777).is(0.4)
            );
        }, ReferenceError);
    });
});

describe("+P()", function() {
    let a, b, c, d, e;

    let DELTA = 0.005;

    before(function() {
        a = EVENT `A`;
        b = EVENT `B`;
        c = EVENT `C`;
        d = EVENT `D`;
        e = EVENT `E`;

        facts(
            P(a).is(0.3),
            P(b).is(0.6),
            P(c)
                .given(a).is(0.8)
                .given(~a).is(0.4),
            P(d)
                .given(a, b).is(0.7)
                .given(a, ~b).is(0.8)
                .given(~a, b).is(0.1)
                .given(~a, ~b).is(0.2),
            P(e)
                .given(c).is(0.7)
                .given(~c).is(0.2)
        );
    });

    it("should return the given probability for entries that exist", function() {
        let result = +P(a);

        result.should.be.closeTo(0.3, DELTA);
    });
    it("should return the given conditional probability for entries that exist", function() {
        let result = +P(c).given(a);

        result.should.be.closeTo(0.8, DELTA);
    });
    it("should sum over nuisance variables to find an overall probability", function() {
        let result = +P(d);

        result.should.be.closeTo(0.32, DELTA);
    });
    it("should work for complex conditional probabilities", function() {
        ( +P(a).given(c) ).should.be.closeTo(0.46, DELTA);  
        ( +P(a).given(~d) ).should.be.closeTo(0.115, DELTA);  
        ( +P(c).given(~a, e) ).should.be.closeTo(0.7, DELTA);  
    });
    it("should work for joint probabilities", function() {
        ( +P(~d, c) ).should.be.closeTo(0.3032, DELTA);  
        ( +P(a, d).given(~b) ).should.be.closeTo(0.24, DELTA);  
    });
});
