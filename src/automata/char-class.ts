import { Record, Set } from "immutable";

/// A class representing the alphabet Σ for a regular language as a set of
/// character classes whose union is the set of all js characters.
export class Alphabet {
    /// A set of non-overlapping character classes which together represent
    /// all possible characters.
    private _symbols: Set<CharClass> = Set.of(CharClass.universal());

    public get symbols(): Set<CharClass> {
        return this._symbols;
    }

    public getSymbol(char: string): CharClass {
        return this._symbols.find((s) => s.includes(char))!;
    }
    public getSymbolForClass(char: CharClass): CharClass {
        return this._symbols.find((s) => s.overlaps(char))!;
    }

    /// Returns the set of `CharClass`es whose union forms the given character
    /// class.
    ///
    /// It is assumed the caller has already ensured that `c` fits in this
    /// alphabet.
    public getConstituentClasses(c: CharClass): Set<CharClass> {
        // Since we know c is made up of exactly a union of _symbols, and
        // _symbols don't overlap, any symbol that overlaps with c must be part
        // of the union that constructs it.
        return this._symbols.filter((s) => s.overlaps(c)).toSet();
    }

    /// Returns true if the given `CharClass` cannot be exactly represented
    /// as the union of `CharClass`es already in the alphabet.
    public requiresExpandingAlphabet(c: CharClass): boolean {
        let constituents = this.getConstituentClasses(c);
        let constituentsClass = CharClass.unionOf(constituents);
        return !constituentsClass.equals(c);
    }

    /// Update the alphabet to be able to describe the `CharClass` c.
    public expandToInclude(c: CharClass) {
        this._symbols = Set(
            this._symbols.flatMap((s) => {
                let overlap = s.intersection(c);
                if (overlap.isEmpty || overlap.equals(s)) return [s];
                return [overlap, s.intersection(overlap.complement())];
            }),
        );
    }
}

function nextChar(c: string): string {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}
function previousChar(c: string): string {
    return String.fromCharCode(c.charCodeAt(0) - 1);
}

export class CharClass {
    private _inverted: boolean;
    private _parts: Set<CharRange>;

    constructor(parts: Set<CharRange>, inverted: boolean) {
        this._parts = parts;
        this._inverted = inverted;
    }

    static single(char: string): CharClass {
        return new CharClass(Set.of(CharRange.single(char)), false);
    }

    static universal(): CharClass {
        return new CharClass(Set(), true);
    }

    static empty(): CharClass {
        return new CharClass(Set(), false);
    }

    static unionOf(classes: Set<CharClass>): CharClass {
        let base = CharClass.empty();
        for (let c of classes) base = base.union(c);
        return base;
    }

    get isInverted(): boolean {
        return this._inverted;
    }
    get parts(): Set<CharRange> {
        return this._parts;
    }

    get isEmpty(): boolean {
        return this._parts.size == 0 && !this._inverted;
    }

    private static getCriticalPoints(a: CharClass, b: CharClass): string[] {
        let allParts = [...a._parts, ...b._parts];
        let points = allParts.flatMap((r) => [
            previousChar(r.start),
            r.start,
            r.end,
            nextChar(r.end),
        ]);
        points.sort();
        return points.slice(1, points.length - 1);
    }

    private setFn(other: CharClass, comp: (a: boolean, b: boolean) => boolean): CharClass {
        let criticalPoints = CharClass.getCriticalPoints(this, other);
        let newInverted = comp(this._inverted, other._inverted);

        if (criticalPoints.length == 0) return new CharClass(Set(), newInverted);

        let include = (r: CharRange) => {
            let start = comp(this.includes(r.start), other.includes(r.start)) != newInverted;
            let end = comp(this.includes(r.end), other.includes(r.end)) != newInverted;
            return start && end;
        };
        let ranges: CharRange[] = [];

        let currentRange = CharRange.range(criticalPoints[0], criticalPoints[1]);
        for (let i = 2; i + 1 < criticalPoints.length; i += 2) {
            let newStart = criticalPoints[i];
            let newEnd = criticalPoints[i + 1];

            if (!include(currentRange)) {
                currentRange = CharRange.range(newStart, newEnd);
                continue;
            }

            let combinedRange = CharRange.range(currentRange.start, newEnd);
            if (newStart <= nextChar(currentRange.end) && include(combinedRange)) {
                currentRange = combinedRange;
            } else {
                ranges.push(currentRange);
                currentRange = CharRange.range(newStart, newEnd);
            }
        }

        if (include(currentRange)) ranges.push(currentRange);

        return new CharClass(Set(ranges), newInverted);
    }

    union(other: CharClass): CharClass {
        return this.setFn(other, (a, b) => a || b);
    }

    intersection(other: CharClass): CharClass {
        return this.setFn(other, (a, b) => a && b);
    }

    complement(): CharClass {
        return new CharClass(this._parts, !this._inverted);
    }

    private nonInvertedIncludes(char: string): boolean {
        return this._parts.has(CharRange.single(char)) || this._parts.some((r) => r.includes(char));
    }

    includes(char: string): boolean {
        let includes = this.nonInvertedIncludes(char);
        return this._inverted ? !includes : includes;
    }

    equals(other: CharClass): boolean {
        return (
            this.intersection(other.complement()).isEmpty &&
            other.intersection(this.complement()).isEmpty
        );
    }

    overlaps(other: CharClass): boolean {
        return !this.intersection(other).isEmpty;
    }

    prettyPrint(): string {
        if (this._parts.size == 0) {
            return this._inverted ? "." : "∅";
        }

        if (!this._inverted && this._parts.size == 1 && this._parts.first()!.isSingle) {
            return `${this._parts.first()!.start}`;
        }

        // TODO: Escape characters.
        let inverted = this._inverted ? "^" : "";
        return `[${inverted}${this._parts.map((p) => p.prettyPrint()).join("")}]`;
    }
}

/// A range of characters inclusive on both ends.
export class CharRange extends Record({ start: " ", end: " " }, "CharRange") {
    static range(start: string, end: string): CharRange {
        return new CharRange({ start, end });
    }

    static single(char: string): CharRange {
        return new CharRange({ start: char, end: char });
    }

    public get isSingle(): boolean {
        return this.start == this.end;
    }

    public includes(char: string): boolean {
        return this.start <= char && char <= this.end;
    }

    public includesRange(range: CharRange): boolean {
        return this.start <= range.start && range.end <= this.end;
    }

    public overlaps(other: CharRange): boolean {
        return other.includes(this.start) || other.includes(this.end) || this.includes(other.start);
    }

    public equals(other: CharRange): boolean {
        return this.start == other.start && this.end == other.end;
    }

    public prettyPrint(): string {
        if (this.isSingle) {
            return this.start;
        } else {
            return `${this.start}-${this.end}`;
        }
    }
}
