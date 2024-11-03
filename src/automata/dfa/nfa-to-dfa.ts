import { Map, Set } from "immutable";
import { NFA, NFAState } from "../nfa/nfa";
import { DFA, DFAState } from "./dfa";

export function nfaToDFA(nfa: NFA): DFA {
    // We map subsets of the NFA's states to dfa states.
    let stateMapping: Map<Set<NFAState>, DFAState> = Map();
    let dfa = new DFA();

    // the set of NFA start states should map to the DFA's start state.
    let nfaStartStates = nfa.startStates.flatMap((s) => s.epsilonClosure).toSet();
    stateMapping = stateMapping.set(nfaStartStates, dfa.startState);

    // Get the DFA state corresponding to the set of NFA states or creates it
    // if it doesn't yet exist. Should have done the epsilon closure already.
    let getDFAState = (nfaStates: Set<NFAState>) => {
        let dfaState = stateMapping.get(nfaStates);
        if (dfaState == undefined) {
            dfaState = dfa.newState();
            stateMapping = stateMapping.set(nfaStates, dfaState);
        }
        return dfaState;
    };

    let queue = [nfaStartStates];
    while (queue.length != 0) {
        let currentStates = queue.pop()!;
        let currentDfaState = getDFAState(currentStates);

        currentDfaState.accept = currentStates.some((s) => s.accept);

        for (let symbol of nfa.symbols) {
            let goesTo = currentStates
                .flatMap((s) => s.transitionsOn(symbol))
                .flatMap((s) => s.epsilonClosure);

            if (!stateMapping.has(goesTo)) queue.push(goesTo);

            let dfaState = getDFAState(goesTo);
            dfa.addTransition(currentDfaState, dfaState, symbol);
        }
    }

    return dfa;
}
