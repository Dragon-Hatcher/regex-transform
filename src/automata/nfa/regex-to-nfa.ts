import {
    AlternationPattern,
    ConcatPattern,
    KleeneStarPattern,
    LiteralPattern,
    Pattern,
    PatternVisitor,
} from "../../regex-comp/parse-tree";
import { NFA, NFAState, NFATransitionCondition } from "./nfa";

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

        inState.addTransitionTo(outState, NFATransitionCondition.singleChar(p.literal));

        return { inState, outState };
    }

    visitConcatPattern(p: ConcatPattern): StartAndEnd {
        let { inState, outState } = p.patterns[0].accept(this);
        for (let i = 1; i < p.patterns.length; i++) {
            let { inState: newIn, outState: newOut } = p.patterns[i].accept(this);
            outState.addTransitionTo(newIn, NFATransitionCondition.epsilon());
            outState = newOut;
        }

        return { inState, outState };
    }

    visitAlternationPattern(p: AlternationPattern): StartAndEnd {
        let left = p.left.accept(this);
        let right = p.right.accept(this);

        let inState = this.nfa.newState();
        let outState = this.nfa.newState();

        inState.addTransitionTo(left.inState, NFATransitionCondition.epsilon());
        inState.addTransitionTo(right.inState, NFATransitionCondition.epsilon());
        left.outState.addTransitionTo(outState, NFATransitionCondition.epsilon());
        right.outState.addTransitionTo(outState, NFATransitionCondition.epsilon());

        return { inState, outState };
    }

    visitKleeneStarPattern(p: KleeneStarPattern): StartAndEnd {
        let { inState, outState } = p.base.accept(this);

        inState.addTransitionTo(outState, NFATransitionCondition.epsilon());
        outState.addTransitionTo(inState, NFATransitionCondition.epsilon());

        return { inState, outState };
    }

    visitEmpty(p: Pattern): StartAndEnd {
        let state = this.nfa.newState();
        return { inState: state, outState: state };
    }
}
