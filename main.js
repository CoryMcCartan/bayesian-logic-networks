let bln = require("./bayes.js")(global); 

function main_() {
    let rain = EVENT `R`,
        cloudy = EVENT `C`,
        sprinkler = EVENT `S`,
        grass_wet = EVENT `G`;

    facts(
        P(cloudy).is(0.4),
        P(rain)
            .given(cloudy).is(0.5)
            .given(~cloudy).is(0.0),
        P(sprinkler)
            .given(cloudy).is(0.01)
            .given(~cloudy).is(0.4),
        P(grass_wet)
            .given(rain, sprinkler).is(0.99)
            .given(rain, ~sprinkler).is(0.8)
            .given(~rain, sprinkler).is(0.9)
            .given(~rain, ~sprinkler).is(0.0)
    );

    console.log(+P(cloudy).given(grass_wet));
}

function main() {
    let burglary = EVENT `B`;
    let earthquake = EVENT `E`;
    let alarm = EVENT `A`;
    let john_calls = EVENT `J`;
    let mary_calls = EVENT `M`;

    facts(
        P(burglary).is(0.001),
        P(earthquake).is(0.001),

        P(alarm)
            .given(burglary, earthquake).is(0.95)
            .given(burglary, ~earthquake).is(0.94)
            .given(~burglary, earthquake).is(0.29)
            .given(~burglary, ~earthquake).is(0.001),

        P(john_calls)
            .given(alarm).is(0.9)
            .given(~alarm).is(0.05),

        P(mary_calls)
            .given(alarm).is(0.7)
            .given(~alarm).is(0.01)
    );

    console.log(+P(burglary).given(john_calls, ~mary_calls));
}

function _main() {
    let a = EVENT `A`;
    let b = EVENT `B`;
    let c = EVENT `C`;
    let d = EVENT `D`;
    let e = EVENT `E`;

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

    console.log(+P(~d, c));
}

function main_() {
    let cancer = EVENT `cancer`;
    let test = EVENT `test`;

    facts(
        P(cancer).is(0.005),
        P(test)
            .given(cancer).is(0.99)
            .given(~cancer).is(0.01)
    );

    console.log(+P(test));
    console.log(+P(cancer).given(test));
}

main_();
