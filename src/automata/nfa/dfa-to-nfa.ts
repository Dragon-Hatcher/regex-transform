import { Map } from "immutable";
import { DFA, DFAState } from "../dfa/dfa";
import { NFA, NFAState } from "./nfa";

export function dfaToNFA(dfa: DFA): NFA {
    let stateMapping: Map<DFAState, NFAState> = Map();
    let nfa = new NFA();

    let getNFAState = (dfaState: DFAState) => {
        let nfaState = stateMapping.get(dfaState);
        if (nfaState == undefined) {
            nfaState = nfa.newState();
            stateMapping = stateMapping.set(dfaState, nfaState);
        }
        return nfaState;
    };

    for (let state of dfa.states) {
        let nfaState = getNFAState(state);

        for (let [on, to] of state.transitions) {
            let toNFAState = getNFAState(to);
            nfa.addTransition(nfaState, toNFAState, on);
        }

        nfaState.accept = state.accept;
    }

    getNFAState(dfa.startState).start = true;

    return nfa;
}
