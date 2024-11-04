import { Set, Map } from "immutable";
import { IDGenerator } from "../../util/ids";
import { Alphabet, CharClass } from "../char-class";

export class DFAState {
    private _id: number;
    private _start: boolean;
    private _accept: boolean = false;

    constructor(id: number, start: boolean) {
        this._id = id;
        this._start = start;
    }

    get id(): number {
        return this._id;
    }
    get start(): boolean {
        return this._start;
    }
    get accept(): boolean {
        return this._accept;
    }
    get transitions(): Map<CharClass, DFAState> {
        return this._transitions;
    }

    set accept(accept: boolean) {
        this._accept = accept;
    }

    private _transitions: Map<CharClass, DFAState> = Map();

    refreshTransitions(alphabet: Alphabet) {
        this._transitions = Map<CharClass, DFAState>().withMutations((newTransitions) => {
            for (let symbol of alphabet.symbols) {
                for (let [on, to] of this.transitions) {
                    if (symbol.overlaps(on)) {
                        newTransitions.set(symbol, to);
                    }
                }
            }
        });
    }

    _unsafeAddTransition(to: DFAState, on: CharClass) {
        this._transitions = this._transitions.set(on, to);
    }

    transitionOn(char: CharClass): DFAState | null {
        return this._transitions.get(char) ?? null;
    }
}

export class DFA {
    private _ids = new IDGenerator();

    private _alphabet = new Alphabet();
    private _startState = new DFAState(this._ids.generate(), true);
    private _states: Set<DFAState> = Set.of(this._startState);

    get startState(): DFAState {
        return this._startState;
    }

    get states(): Set<DFAState> {
        return this._states;
    }

    newState(): DFAState {
        let state = new DFAState(this._ids.generate(), false);
        this._states = this._states.add(state);
        return state;
    }

    private addSymbolToAlphabet(symbol: CharClass) {
        if (!this._alphabet.requiresExpandingAlphabet(symbol)) return;

        this._alphabet.expandToInclude(symbol);
        for (let state of this._states) {
            state.refreshTransitions(this._alphabet);
        }
    }

    addTransition(from: DFAState, to: DFAState, on: CharClass) {
        this.addSymbolToAlphabet(on);
        let symbol = this._alphabet.getSymbolForClass(on);
        from._unsafeAddTransition(to, symbol);
    }

    matches(str: string): boolean {
        let state = this._startState;

        for (let c of str) {
            let symbol = this._alphabet.getSymbol(c);
            let next = state.transitionOn(symbol);
            if (next == null) return false;
            state = next;
        }

        return state.accept;
    }

    copy(): DFA {
        let n = new DFA();
        n._alphabet = this._alphabet.copy();

        let map = Map<DFAState, DFAState>();
        map = map.set(this.startState, n.startState);
        n.startState.accept = this.startState.accept;

        for (let state of this.states) {
            if (state != this.startState) {
                let newState = n.newState();
                newState.accept = state.accept;
                map = map.set(state, newState);
            }
        }

        for (let state of this.states) {
            for (let [on, to] of state.transitions) {
                n.addTransition(map.get(state)!, map.get(to)!, on);
            }
        }

        return n;
    }

    prettyPrint(): any {
        let msg = "";

        for (let state of this._states) {
            msg += `State ${state.id}:`;
            if (state.start) msg += " (start) ";
            if (state.accept) msg += " (accept) ";
            msg += "\n";

            for (let [on, to] of state.transitions) {
                msg += `  --> ${to.id} on ${on.prettyPrint()}\n`;
            }
            msg += "\n";
        }

        return msg;
    }
}
