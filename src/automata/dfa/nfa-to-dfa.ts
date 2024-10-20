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

    throw Error("TODO: NFA to DFA");
}
