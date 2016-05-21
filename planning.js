P("burglary", 0.001);
P("earthquake", 0.002);

P("alarm", ["burglary, earthquake"], (burglary, earthquake) => {
    if (burglary)
        if (earthquake)
            return 0.95;
        else
            return 0.94;
    else
        if (earthquake)
            return 0.29;
        else
            return 0.001;
});

P("john calls", ["alarm"], (alarm) => {
    if (alarm)
        return 0.9;
    else
        return 0.05;
});

P("mary calls", ["alarm"], (alarm) => {
    if (alarm)
        return 0.7;
    else
        return 0.01;
});

Observe("john calls", true);
Observe("mary calls", false);

query("burglary");
