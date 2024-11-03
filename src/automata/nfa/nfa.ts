import { IDGenerator } from "../../util/ids";
import { Alphabet, CharClass } from "../char-class";
import { Set, Map } from "immutable";

export class NFAState {
    private _id: number;

    private _accept: boolean;
    private _start: boolean;

    private _transitions: Map<CharClass, Set<NFAState>> = Map();
    private _epsilonTransitions: Set<NFAState> = Set();

    constructor(id: number) {
        this._id = id;
    }

    get id(): number {
        return this._id;
    }
    get accept(): boolean {
        return this._accept;
    }
    get start(): boolean {
        return this._start;
    }
    get transitions(): Map<CharClass, Set<NFAState>> {
        return this._transitions;
    }
    get epsilonTransitions(): Set<NFAState> {
        return this._epsilonTransitions;
    }

    set accept(accept: boolean) {
        this._accept = accept;
    }

    set start(start: boolean) {
        this._start = start;
    }

    refreshTransitions(alphabet: Alphabet) {
        this._transitions = Map<CharClass, Set<NFAState>>().withMutations((newTransitions) => {
            for (let symbol of alphabet.symbols) {
                for (let [on, to] of this.transitions) {
                    if (symbol.overlaps(on)) {
                        let oldTo = newTransitions.get(symbol) ?? Set();
                        newTransitions.set(symbol, oldTo.union(to));
                    }
                }
            }
        });
    }

    _unsafeAddTransition(to: NFAState, on: CharClass | null) {
        if (on) {
            let old = this._transitions.get(on) ?? Set();
            this._transitions = this._transitions.set(on, old.add(to));
        } else {
            this._epsilonTransitions = this._epsilonTransitions.add(to);
        }
    }

    transitionsOn(char: CharClass): Set<NFAState> {
        return this._transitions.get(char) ?? Set();
    }

    get epsilonClosure(): Set<NFAState> {
        return Set<NFAState>().withMutations((reachable) => {
            let border: NFAState[] = [this];

            while (border.length > 0) {
                let next = border.pop()!;
                reachable.add(next);

                for (let e of next.epsilonTransitions) {
                    if (!reachable.has(e)) border.push(e);
                }
            }
        });
    }
}

export class NFA {
    private _ids = new IDGenerator();
    private _alphabet = new Alphabet();
    private _states: Set<NFAState> = Set();

    get states(): Set<NFAState> {
        return this._states;
    }

    get startStates(): Set<NFAState> {
        return this._states.filter((s) => s.start);
    }

    get symbols(): Set<CharClass> {
        return this._alphabet.symbols;
    }

    newState(): NFAState {
        let state = new NFAState(this._ids.generate());
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

    addTransition(from: NFAState, to: NFAState, on: CharClass | null) {
        if (on) this.addSymbolToAlphabet(on);

        let symbol = on ? this._alphabet.getSymbolForClass(on) : null;
        from._unsafeAddTransition(to, symbol);
    }

    matches(str: string): boolean {
        let states = this._states
            .filter((s) => s.start)
            .flatMap((s) => s.epsilonClosure)
            .toSet();

        for (let c of str) {
            let symbol = this._alphabet.getSymbol(c);

            states = states
                .flatMap((s) => s.transitionsOn(symbol))
                .flatMap((s) => s.epsilonClosure)
                .toSet();
        }

        // If any of the states are accept states, accept.
        return states.some((s) => s.accept);
    }

    prettyPrint(): string {
        let msg = "";

        for (let state of this._states) {
            msg += `State ${state.id}:`;
            if (state.start) msg += " (start) ";
            if (state.accept) msg += " (accept) ";
            msg += "\n";

            for (let [on, to] of state.transitions) {
                msg += `  --> ${to.map((s) => s.id).join(", ")} on ${on.prettyPrint()}\n`;
            }
            if (!state.epsilonTransitions.isEmpty()) {
                msg += `  --> ${state.epsilonTransitions.map((s) => s.id).join(", ")} on ε\n`;
            }
            msg += "\n";
        }

        return msg;
    }
}
