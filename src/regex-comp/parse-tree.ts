import { CharClass } from "../automata/char-class";

export interface Pattern {
    accept<T>(visitor: PatternVisitor<T>): T;
}

export interface PatternVisitor<T> {
    visitLiteralPattern(p: LiteralPattern): T;
    visitConcatPattern(p: ConcatPattern): T;
    visitAlternationPattern(p: AlternationPattern): T;
    visitKleeneStarPattern(p: KleeneStarPattern): T;
    visitEmpty(p: Pattern): T;
    visitNull(p: Pattern): T;
}

export class LiteralPattern implements Pattern {
    private _literal: CharClass;

    constructor(literal: CharClass) {
        this._literal = literal;
    }

    get literal() {
        return this._literal;
    }

    accept<T>(visitor: PatternVisitor<T>): T {
        return visitor.visitLiteralPattern(this);
    }
}

export class ConcatPattern implements Pattern {
    private _patterns: Pattern[];

    constructor(patterns: Pattern[]) {
        this._patterns = patterns;
    }

    static newSimp(patterns: Pattern[]): Pattern {
        if (patterns.some((pat) => pat instanceof NullPattern)) {
            return new NullPattern();
        }

        let noEpsilon = patterns.filter((pat) => !(pat instanceof EmptyPattern));

        if (noEpsilon.length == 0) {
            return new EmptyPattern();
        } else if (noEpsilon.length == 1) {
            return noEpsilon[0];
        } else {
            return new ConcatPattern(noEpsilon);
        }
    }

    get patterns() {
        return this._patterns;
    }

    accept<T>(visitor: PatternVisitor<T>): T {
        return visitor.visitConcatPattern(this);
    }
}

export class AlternationPattern implements Pattern {
    private _left: Pattern;
    private _right: Pattern;

    constructor(left: Pattern, right: Pattern) {
        this._left = left;
        this._right = right;
    }

    static newSimple(left: Pattern, right: Pattern): Pattern {
        if (left instanceof NullPattern) {
            return right;
        } else if (right instanceof NullPattern) {
            return left;
        } else {
            return new AlternationPattern(left, right);
        }
    }

    get left() {
        return this._left;
    }
    get right() {
        return this._right;
    }

    accept<T>(visitor: PatternVisitor<T>): T {
        return visitor.visitAlternationPattern(this);
    }
}

export class KleeneStarPattern implements Pattern {
    private _base: Pattern;

    constructor(base: Pattern) {
        this._base = base;
    }

    static newSimple(base: Pattern): Pattern {
        if (base instanceof EmptyPattern || base instanceof NullPattern) {
            return new EmptyPattern();
        }

        return new KleeneStarPattern(base);
    }

    get base() {
        return this._base;
    }

    accept<T>(visitor: PatternVisitor<T>): T {
        return visitor.visitKleeneStarPattern(this);
    }
}

export class EmptyPattern implements Pattern {
    accept<T>(visitor: PatternVisitor<T>): T {
        return visitor.visitEmpty(this);
    }
}

export class NullPattern implements Pattern {
    accept<T>(visitor: PatternVisitor<T>): T {
        return visitor.visitNull(this);
    }
}

export class PatternPrinter implements PatternVisitor<string> {
    visitLiteralPattern(p: LiteralPattern): string {
        return `(lit '${p.literal.prettyPrint()}')`;
    }

    visitConcatPattern(p: ConcatPattern): string {
        return `(concat ${p.patterns.map((p) => p.accept(this)).join(" ")})`;
    }

    visitAlternationPattern(p: AlternationPattern): string {
        return `(alt ${p.left.accept(this)} ${p.right.accept(this)})`;
    }

    visitKleeneStarPattern(p: KleeneStarPattern): string {
        return `(kleene ${p.base.accept(this)})`;
    }

    visitEmpty(p: Pattern): string {
        return `ε`;
    }

    visitNull(p: Pattern): string {
        return `∅`;
    }
}

export class RegexPatternPrinter implements PatternVisitor<string> {
    visitLiteralPattern(p: LiteralPattern): string {
        return p.literal.prettyPrint();
    }

    visitConcatPattern(p: ConcatPattern): string {
        return p.patterns.map((p) => p.accept(this)).join("");
    }

    visitAlternationPattern(p: AlternationPattern): string {
        return `(${p.left.accept(this)}|${p.right.accept(this)})`;
    }

    visitKleeneStarPattern(p: KleeneStarPattern): string {
        return `(${p.base.accept(this)})*`;
    }

    visitEmpty(p: Pattern): string {
        return `ε`;
    }

    visitNull(p: Pattern): string {
        return `∅`;
    }
}
