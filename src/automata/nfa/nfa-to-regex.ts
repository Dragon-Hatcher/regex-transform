import {
    AlternationPattern,
    ConcatPattern,
    EmptyPattern,
    KleeneStarPattern,
    LiteralPattern,
    NullPattern,
    Pattern,
} from "../../regex-comp/parse-tree";
import { simpRegex } from "../../regex-comp/simp-regex";
import { CharClass } from "../char-class";
import { NFA } from "./nfa";

export function nfaToRegex(nfa: NFA): Pattern {
    // https://cs.stackexchange.com/a/2392

    let states = [
        ...nfa.states.filter((s) => s.start).toArray(),
        ...nfa.states.filter((s) => !s.start).toArray(),
    ];

    let b: Pattern[] = states.map((s) => (s.accept ? new EmptyPattern() : new NullPattern()));
    let a: Pattern[][] = states.map((s1) =>
        states.map((s2) => {
            let charTransition = s1.transitions
                .filter((to, _) => to.contains(s2))
                .map((_, on) => on)
                .reduce((c1, c2) => c1.union(c2), CharClass.empty());
            let pattern = charTransition.isEmpty
                ? new NullPattern()
                : new LiteralPattern(charTransition);

            if (s1.epsilonTransitions.has(s2)) {
                pattern = AlternationPattern.newSimple(pattern, new EmptyPattern());
            }

            return pattern;
        }),
    );

    for (let n = states.length - 1; n >= 0; n--) {
        b[n] = ConcatPattern.newSimp([KleeneStarPattern.newSimple(a[n][n]), b[n]]);

        for (let j = 0; j < n; j++) {
            a[n][j] = ConcatPattern.newSimp([KleeneStarPattern.newSimple(a[n][n]), a[n][j]]);
        }

        for (let i = 0; i < n; i++) {
            b[i] = AlternationPattern.newSimple(b[i], ConcatPattern.newSimp([a[i][n], b[n]]));
            for (let j = 0; j < n; j++) {
                a[i][j] = AlternationPattern.newSimple(
                    a[i][j],
                    ConcatPattern.newSimp([a[i][n], a[n][j]]),
                );
            }
        }
    }

    let finalPattern = new NullPattern();
    for (let i = 0; i < states.length; i++) {
        if (states[i].start) finalPattern = AlternationPattern.newSimple(finalPattern, b[i]);
    }

    return simpRegex(finalPattern);
}
