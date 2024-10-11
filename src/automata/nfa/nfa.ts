import { NFACharClass } from "./nfa-char-class";

export class NFAState {
    private _nfa: NFA;
    private _accept: boolean;
    private _start: boolean;

    private _transitions: Map<NFAState, NFATransitionCondition> = new Map();
    _epsilonTransitions: Set<NFAState> = new Set();
    _incomingTransitions: Set<NFAState> = new Set();

    constructor(nfa: NFA) {
        this._nfa = nfa;
    }

    get nfa(): NFA {
        return this._nfa;
    }
    get accept(): boolean {
        return this._accept;
    }
    get start(): boolean {
        return this._start;
    }

    set accept(accept: boolean) {
        this._accept = accept;
        if (accept) {
            this._nfa._acceptStates.add(this);
        } else {
            this._nfa._acceptStates.delete(this);
        }
    }

    set start(start: boolean) {
        this._start = start;
        if (start) {
            this._nfa._startStates.add(this);
        } else {
            this._nfa._startStates.delete(this);
        }
    }

    addTransitionTo(to: NFAState, condition: NFATransitionCondition) {
        this._transitions.set(to, condition);
        to._incomingTransitions.add(this);

        if (condition.isEpsilon) {
            this._epsilonTransitions.add(to);
        } else {
            this._epsilonTransitions.delete(to);
        }
    }

    transitionsOn(char: string): Set<NFAState> {
        let states = new Set<NFAState>();
        for (let [to, on] of this._transitions) {
            if (on.matchesChar(char)) {
                states.add(to);
            }
        }
        return states;
    }

    get epsilonClosure(): Set<NFAState> {
        let set = new Set<NFAState>();
        let toVisit: NFAState[] = [this];

        while (toVisit.length > 0) {
            let next = toVisit.shift()!;
            set.add(next);

            for (let e of next._epsilonTransitions) {
                if (!set.has(e)) {
                    set.add(e);
                    toVisit.push(e);
                }
            }
        }

        return set;
    }

    get transitions(): Map<NFAState, NFATransitionCondition> {
        return this._transitions;
    }
}

export class NFATransitionCondition {
    // The character set or null if it is an epsilon transition.
    private _chars: NFACharClass | null;

    private constructor(chars: NFACharClass | null) {
        this._chars = chars;
    }

    get isEpsilon(): boolean {
        return this._chars == null;
    }

    matchesChar(c: string): boolean {
        return this._chars?.includes(c) ?? false;
    }

    prettyPrint(): string {
        return !this._chars ? "ε" : `'${this._chars.prettyPrint()}'`;
    }

    static epsilon(): NFATransitionCondition {
        return new NFATransitionCondition(null);
    }

    static singleChar(char: string): NFATransitionCondition {
        return new NFATransitionCondition(NFACharClass.single(char));
    }
}

export class NFA {
    _states: NFAState[] = [];
    _acceptStates: Set<NFAState> = new Set();
    _startStates: Set<NFAState> = new Set();

    newState(): NFAState {
        let state = new NFAState(this);
        this._states.push(state);
        return state;
    }

    deleteState(state: NFAState) {
        this._states = this._states.filter((s) => s != state);
        this._acceptStates.delete(state);
        this._startStates.delete(state);
    }

    matches(str: string): boolean {
        let states = new Set<NFAState>();
        for (let s of this._startStates) {
            states.add(s);
            for (let e of s.epsilonClosure) {
                states.add(e);
            }
        }

        for (let c of str) {
            let newStates = new Set<NFAState>();

            // For each state we are currently in, find all its transitions.
            for (let s of states) {
                let transitions = s.transitionsOn(c);

                // Now add all of the states and their epsilon transitions
                for (let t of transitions) {
                    newStates.add(t);
                    for (let e of t.epsilonClosure) {
                        newStates.add(e);
                    }
                }
            }

            states = newStates;
        }

        // If any of the states are accept states, accept.
        return [...states].some((s) => this._acceptStates.has(s));
    }

    prettyPrint(): string {
        let states = this._states;

        let msg = "";

        for (let i = 0; i < states.length; i++) {
            let s = states[i];

            msg += `State ${i}:`;
            if (this._startStates.has(s)) msg += " (start) ";
            if (this._acceptStates.has(s)) msg += " (accept) ";
            msg += "\n";

            for (let [to, on] of s.transitions) {
                let toIdx = states.indexOf(to);
                msg += `  --> ${toIdx} on ${on.prettyPrint()}\n`;
            }
            msg += "\n";
        }

        return msg;
    }
}
