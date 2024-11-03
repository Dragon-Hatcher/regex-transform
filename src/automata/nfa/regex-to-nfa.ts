import {
    AlternationPattern,
    ConcatPattern,
    KleeneStarPattern,
    LiteralPattern,
    Pattern,
    PatternVisitor,
} from "../../regex-comp/parse-tree";
import { CharClass } from "../char-class";
import { NFA, NFAState } from "./nfa";

export function regexToNFA(pattern: Pattern): NFA {
    let converter = new NFAConverterVisitor();
    let { inState, outState } = pattern.accept(converter);
    inState.start = true;
    outState.accept = true;
    return converter.nfa;
}

type StartAndEnd = {
    inState: NFAState;
    outState: NFAState;
};

class NFAConverterVisitor implements PatternVisitor<StartAndEnd> {
    nfa = new NFA();

    visitLiteralPattern(p: LiteralPattern): StartAndEnd {
        let inState = this.nfa.newState();
        let outState = this.nfa.newState();

        this.nfa.addTransition(inState, outState, CharClass.single(p.literal));

        return { inState, outState };
    }

    visitConcatPattern(p: ConcatPattern): StartAndEnd {
        let { inState, outState } = p.patterns[0].accept(this);
        for (let i = 1; i < p.patterns.length; i++) {
            let { inState: newIn, outState: newOut } = p.patterns[i].accept(this);
            this.nfa.addTransition(outState, newIn, null);
            outState = newOut;
        }

        return { inState, outState };
    }

    visitAlternationPattern(p: AlternationPattern): StartAndEnd {
        let left = p.left.accept(this);
        let right = p.right.accept(this);

        let inState = this.nfa.newState();
        let outState = this.nfa.newState();

        this.nfa.addTransition(inState, left.inState, null);
        this.nfa.addTransition(inState, right.inState, null);
        this.nfa.addTransition(left.outState, outState, null);
        this.nfa.addTransition(right.outState, outState, null);

        return { inState, outState };
    }

    visitKleeneStarPattern(p: KleeneStarPattern): StartAndEnd {
        let { inState, outState } = p.base.accept(this);

        this.nfa.addTransition(inState, outState, null);
        this.nfa.addTransition(outState, inState, null);

        return { inState, outState };
    }

    visitEmpty(p: Pattern): StartAndEnd {
        let state = this.nfa.newState();
        return { inState: state, outState: state };
    }
}
