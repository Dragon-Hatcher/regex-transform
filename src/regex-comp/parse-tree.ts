export interface Pattern {
    accept<T>(visitor: PatternVisitor<T>): T;
}

export interface PatternVisitor<T> {
    visitLiteralPattern(p: LiteralPattern): T;
    visitConcatPattern(p: ConcatPattern): T;
    visitAlternationPattern(p: AlternationPattern): T;
    visitKleeneStarPattern(p: KleeneStarPattern): T;
    visitEmpty(p: Pattern): T;
}

export class LiteralPattern implements Pattern {
    private _literal: string;

    constructor(literal: string) {
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

    static empty(): ConcatPattern {
        return new ConcatPattern([]);
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

export class PatternPrinter implements PatternVisitor<string> {
    visitLiteralPattern(p: LiteralPattern): string {
        return `(lit '${p.literal}')`;
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
}
