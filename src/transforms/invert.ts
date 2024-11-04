import { DFA } from "../automata/dfa/dfa";

export function invertDFA(dfa: DFA): DFA {
    let newDFA = dfa.copy();

    for (let state of newDFA.states) {
        state.accept = !state.accept;
    }

    // console.log("invert", newDFA.prettyPrint())
    return newDFA;
}
