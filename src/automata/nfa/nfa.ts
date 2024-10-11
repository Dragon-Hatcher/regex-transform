import { IDGenerator } from "../../util/ids";
import { NFACharClass } from "./nfa-char-class";
import { Set, Map } from "immutable";

export class NFAState {
    private _id: number;

    private _accept: boolean;
    private _start: boolean;

    private _transitions: Map<NFAState, NFATransitionCondition> = Map();
    private _epsilonTransitions: Set<NFAState> = Set();
    private _incomingTransitions: Set<NFAState> = Set();

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
    get transitions(): Map<NFAState, NFATransitionCondition> {
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

    addTransitionTo(to: NFAState, condition: NFATransitionCondition) {
        this._transitions = this._transitions.set(to, condition);
        to._incomingTransitions = to._incomingTransitions.add(this);

        this._epsilonTransitions = condition.isEpsilon
            ? this._epsilonTransitions.add(to)
            : this._epsilonTransitions.delete(to);
    }

    transitionsOn(char: string): Set<NFAState> {
        return this._transitions
            .filter((on, _) => on.matchesChar(char))
            .map((_, to) => to)
            .toSet();
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
    private _ids = new IDGenerator();
    private _states: Set<NFAState> = Set();

    newState(): NFAState {
        let state = new NFAState(this._ids.generate());
        this._states = this._states.add(state);
        return state;
    }

    matches(str: string): boolean {
        let states = this._states
            .filter((s) => s.start)
            .flatMap((s) => s.epsilonClosure)
            .toSet();

        for (let c of str) {
            states = states
                .flatMap((s) => s.transitionsOn(c))
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

            for (let [to, on] of state.transitions) {
                msg += `  --> ${to.id} on ${on.prettyPrint()}\n`;
            }
            msg += "\n";
        }

        return msg;
    }
}
