burglary = E();
earthquake = E();
alarm = E();
john_calls = E();
mary_calls = E();

P(burglary).is(0.001);
P(earthquake).is(0.001);

P(alarm)
.given([earthquake, burglary], (there_is) => {
    if (there_is.burglary)
        if (there_is.earthquake)
            return 0.95;
        else
            return 0.94;
    else
        if (there_is.earthquake)
            return 0.29;
        else
            return 0.001;
});

OR 

P(alarm)
    .given(burglary, earthquake).is(0.95)
    .given(burglary, not(earthquake)).is(0.94)
    .given(not(burglary), earthquake).is(0.29)
    .given(not(burglary), not(earthquake)).is(0.001)

P(john_calls)
    .given(alarm).is(0.9)
    .given(not(alarm)).is(0.05);

P(mary_calls)
    .given(alarm).is(0.7)
    .given(not(alarm)).is(0.01);

OR 

P(john_calls)
.given([alarm], (there_is) => {
    if (there_is.alarm)
        return 0.7;
    else
        return 0.01;
});


Observe(john_calls);
Observe(not(mary_calls));

+P(burglary); 
