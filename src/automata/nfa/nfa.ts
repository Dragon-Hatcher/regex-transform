function getStateImpl(state: NFAState): NFAStateImpl {
    return (state as any).impl;
}

export class NFAState {
    private impl: NFAStateImpl;

    constructor(impl: NFAStateImpl) {
        this.impl = impl;
    }

    public get accept(): boolean {
        return this.impl.accept;
    }
    public set accept(accept: boolean) {
        this.impl.accept = accept;
    }
    public get start(): boolean {
        return this.impl.start;
    }
    public set start(start: boolean) {
        this.impl.start = start;
    }

    public addTransitionTo(to: NFAState, condition: NFAEpsilonTransition) {
        this.impl.addTransitionTo(to.impl, condition);
    }
}

class NFAStateImpl {
    private nfa: NFAImpl;
    private _accept: boolean;
    private _start: boolean;

    private _transitions: Map<NFAStateImpl, NFATransitionCondition> = new Map();
    private _epsilonTransitions: Set<NFAStateImpl> = new Set();
    private incomingTransitions: Set<NFAStateImpl> = new Set();

    constructor(nfa: NFAImpl) {
        this.nfa = nfa;
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
            this.nfa.acceptStates.add(this);
        } else {
            this.nfa.acceptStates.delete(this);
        }
    }

    set start(start: boolean) {
        this._start = start;
        if (start) {
            this.nfa.startStates.add(this);
        } else {
            this.nfa.startStates.delete(this);
        }
    }

    addTransitionTo(to: NFAStateImpl, condition: NFAEpsilonTransition) {
        this._transitions.set(to, condition);
        to.incomingTransitions.add(this);

        if (condition.isEpsilon) {
            this._epsilonTransitions.add(to);
        } else {
            this._epsilonTransitions.delete(to);
        }
    }

    transitionsOn(char: string): Set<NFAStateImpl> {
        let states = new Set<NFAStateImpl>();
        for (let [to, on] of this._transitions) {
            if (on.matchesChar(char)) {
                states.add(to);
            }
        }
        return states;
    }

    get epsilonClosure(): Set<NFAStateImpl> {
        let set = new Set<NFAStateImpl>();
        let toVisit: NFAStateImpl[] = [this];

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

    get transitions(): Map<NFAStateImpl, NFATransitionCondition> {
        return this._transitions;
    }
}

export abstract class NFATransitionCondition {
    abstract get isEpsilon(): boolean;

    abstract matchesChar(c: string): boolean;
    abstract prettyPrint(): string;

    static epsilon(): NFATransitionCondition {
        return new NFAEpsilonTransition();
    }

    static singleChar(char: string): NFATransitionCondition {
        return new NFASingleCharTransition(char);
    }
}

class NFAEpsilonTransition extends NFATransitionCondition {
    get isEpsilon(): boolean {
        return true;
    }

    matchesChar(_: string): boolean {
        return false;
    }

    prettyPrint(): string {
        return "ε";
    }
}

class NFASingleCharTransition extends NFATransitionCondition {
    private char: string;

    constructor(char: string) {
        super();
        this.char = char;
    }

    get isEpsilon(): boolean {
        return false;
    }

    matchesChar(c: string): boolean {
        return c == this.char;
    }

    prettyPrint(): string {
        return `'${this.char}'`;
    }
}

export class NFA {
    private impl: NFAImpl;

    constructor() {
        this.impl = new NFAImpl();
    }

    public newState(): NFAState {
        return new NFAState(this.impl.newState());
    }

    public deleteState(state: NFAState) {
        this.impl.deleteState(getStateImpl(state));
    }

    public matches(str: string): boolean {
        return this.impl.matches(str);
    }

    public prettyPrint(): string {
        return this.impl.prettyPrint();
    }
}

class NFAImpl {
    states: NFAStateImpl[] = [];
    acceptStates: Set<NFAStateImpl> = new Set();
    startStates: Set<NFAStateImpl> = new Set();

    newState(): NFAStateImpl {
        let state = new NFAStateImpl(this);
        this.states.push(state);
        return state;
    }

    deleteState(state: NFAStateImpl) {
        this.states = this.states.filter((s) => s != state);
        this.acceptStates.delete(state);
        this.startStates.delete(state);
    }

    matches(str: string): boolean {
        let states = new Set<NFAStateImpl>();
        for (let s of this.startStates) {
            states.add(s);
            for (let e of s.epsilonClosure) {
                states.add(e);
            }
        }

        for (let c of str) {
            let newStates = new Set<NFAStateImpl>();

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
        return [...states].some((s) => this.acceptStates.has(s));
    }

    prettyPrint(): string {
        let states = this.states;

        let msg = "";

        for (let i = 0; i < states.length; i++) {
            let s = states[i];

            msg += `State ${i}:`;
            if (this.startStates.has(s)) msg += " (start) ";
            if (this.acceptStates.has(s)) msg += " (accept) ";
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
