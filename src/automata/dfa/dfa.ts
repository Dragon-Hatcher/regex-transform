import { Set, Map } from "immutable";
import { IDGenerator } from "../../util/ids";
import { CharClass } from "../char-class";

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
    get transitions(): Map<DFAState, CharClass> {
        return this._transitions;
    }

    set accept(accept: boolean) {
        this._accept = accept;
    }

    private _transitions: Map<DFAState, CharClass> = Map();
    private _incomingTransitions: Set<DFAState> = Set();

    addTransitionTo(to: DFAState, condition: CharClass) {
        // TODO: check overlap

        this._transitions = this._transitions.set(to, condition);
        to._incomingTransitions = to._incomingTransitions.add(this);
    }

    transitionOn(char: string): DFAState | null {
        return this._transitions.findKey((on, _) => on.includes(char)) ?? null;
    }
}

export class DFA {
    private _ids = new IDGenerator();

    private _startState = new DFAState(this._ids.generate(), true);
    private _states: Set<DFAState> = Set.of(this._startState);

    get startState(): DFAState {
        return this._startState;
    }

    get states(): Set<DFAState> {
        return this.states;
    }

    public newState(): DFAState {
        let state = new DFAState(this._ids.generate(), false);
        this._states = this._states.add(state);
        return state;
    }

    public matches(str: string): boolean {
        let state = this._startState;

        for (let c of str) {
            let next = state.transitionOn(c);
            if (next == null) return false;
            state = next;
        }

        return state.accept;
    }
}
