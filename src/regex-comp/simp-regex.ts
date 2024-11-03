import {
    AlternationPattern,
    ConcatPattern,
    EmptyPattern,
    KleeneStarPattern,
    LiteralPattern,
    NullPattern,
    Pattern,
    PatternVisitor,
} from "./parse-tree";

export function simpRegex(regex: Pattern): Pattern {
    return regex.accept(new SimpRegex());
}

class SimpRegex implements PatternVisitor<Pattern> {
    visitLiteralPattern(p: LiteralPattern): Pattern {
        return p.literal.isEmpty ? new NullPattern() : p;
    }

    visitConcatPattern(p: ConcatPattern): Pattern {
        let partsSimplified = p.patterns.map((pat) => pat.accept(this));

        if (partsSimplified.some((pat) => pat instanceof NullPattern)) {
            return new NullPattern();
        }

        let noEpsilon = partsSimplified.filter((pat) => !(pat instanceof EmptyPattern));

        if (noEpsilon.length == 0) {
            return new EmptyPattern();
        } else if (noEpsilon.length == 1) {
            return noEpsilon[0];
        } else {
            return new ConcatPattern(noEpsilon);
        }
    }

    visitAlternationPattern(p: AlternationPattern): Pattern {
        let left = p.left.accept(this);
        let right = p.right.accept(this);

        if (left instanceof NullPattern) {
            return right;
        }
        if (right instanceof NullPattern) {
            return left;
        }
        return new AlternationPattern(left, right);
    }

    visitKleeneStarPattern(p: KleeneStarPattern): Pattern {
        let base = p.base.accept(this);

        if (base instanceof EmptyPattern || base instanceof NullPattern) {
            return new EmptyPattern();
        }

        return new KleeneStarPattern(base);
    }

    visitEmpty(p: Pattern): Pattern {
        return p;
    }

    visitNull(p: Pattern): Pattern {
        return p;
    }
}
