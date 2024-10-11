export class NFACharClass {
    inverted: boolean;
    parts: CharRange[];

    private constructor(parts: CharRange[], inverted: boolean) {
        this.parts = parts;
        this.inverted = inverted;
    }

    static single(char: string): NFACharClass {
        return new NFACharClass([CharRange.single(char)], false);
    }

    union(other: NFACharClass): NFACharClass {
        throw Error("TODO");
    }

    intersection(other: NFACharClass): NFACharClass {
        throw Error("TODO");
    }

    complement(): NFACharClass {
        let parts = [...this.parts];
        return new NFACharClass(parts, !this.inverted);
    }

    private nonInvertedIncludes(char: string): boolean {
        return this.parts.some((r) => r.includes(char));
    }

    public includes(char: string): boolean {
        let includes = this.nonInvertedIncludes(char);
        return this.inverted ? !includes : includes;
    }

    public prettyPrint(): string {
        if (this.parts.length == 0) {
            return "∅";
        }

        if (!this.inverted && this.parts.length == 1 && this.parts[0].isSingle) {
            return `'${this.parts[0].start}'`;
        }

        // TODO: Escape characters.
        let inverted = this.inverted ? "^" : "";
        return `[${inverted}${this.parts.map((p) => p.prettyPrint()).join("")}]`;
    }
}

export class CharRange {
    _start: string;
    _end: string;

    private constructor(start, end) {
        this._start = start;
        this._end = end;
    }

    static range(start: string, end: string): CharRange {
        return new CharRange(start, end);
    }

    static single(char: string): CharRange {
        return new CharRange(char, char);
    }

    public get start(): string {
        return this._start;
    }
    public get end(): string {
        return this._end;
    }

    public get isSingle(): boolean {
        return this._start == this._end;
    }

    public includes(char: string): boolean {
        return this._start <= char && char <= this._end;
    }

    public prettyPrint(): string {
        if (this.isSingle) {
            return this.start;
        } else {
            return `${this.start}-${this.end}`;
        }
    }
}
