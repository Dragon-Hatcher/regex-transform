import { Set } from "immutable";
import { Alphabet, CharClass, CharRange } from "./char-class";

describe("test char classes", () => {
    test("test char range includes", () => {
        let c = CharRange.single("a");
        expect(c.includes("a")).toBe(true);
        expect(c.includes("b")).toBe(false);
        expect(c.includes("")).toBe(false);
        expect(c.includes("aa")).toBe(false);

        expect(c.equals(CharRange.single("a"))).toBe(true);
    });

    test("test char class set functions", () => {
        expect(parse("a").union(parse("b")).union(parse("[c-d]")).prettyPrint()).toBe("[a-d]");
        expect(parse("[^a-z]").union(parse("l")).prettyPrint()).toBe("[^a-km-z]");
        expect(parse("[^a-z]").union(parse("[lm]")).prettyPrint()).toBe("[^a-kn-z]");
        expect(parse("[a-z]").union(parse("[0-9]")).prettyPrint()).toBe("[0-9a-z]");
        expect(parse("[^a-z]").union(parse("[a-z]")).prettyPrint()).toBe(".");

        expect(parse("[^a-z]").intersection(parse("l")).prettyPrint()).toBe("∅");
        expect(parse("[^a-z]").intersection(parse("[0-9]")).prettyPrint()).toBe("[0-9]");
        expect(parse("[^a-z0-1]").intersection(parse("[0-9]")).prettyPrint()).toBe("[2-9]");
        expect(parse("[a-f]").intersection(parse("[e-z]")).prettyPrint()).toBe("[e-f]");
        expect(parse("[^a]").intersection(parse("b")).prettyPrint()).toBe("b");
    });

    test("test alphabet", () => {
        let alpha = new Alphabet();
        expect(alpha.symbols.size).toBe(1);

        alpha.expandToInclude(parse("a"));
        expect(alpha.symbols.size).toBe(2);

        alpha.expandToInclude(parse("b"));
        expect(alpha.symbols.size).toBe(3);

        alpha.expandToInclude(parse("[ab]"));
        expect(alpha.symbols.size).toBe(3);

        alpha.expandToInclude(parse("[a-b]"));
        expect(alpha.symbols.size).toBe(3);

        alpha.expandToInclude(parse("[m-z]"));
        expect(alpha.symbols.size).toBe(4);

        alpha.expandToInclude(parse("p"));
        expect(alpha.symbols.size).toBe(5);

        alpha.expandToInclude(parse("[^]"));
        expect(alpha.symbols.size).toBe(5);
    });
});

function parse(str: string): CharClass {
    if (str == ".") {
        return CharClass.universal();
    } else if (str[0] != "[") {
        return CharClass.single(str[0]);
    }

    let i = 0;
    i++; // left bracket

    let inverted = false;
    if (str[i] == "^") {
        i++;
        inverted = true;
    }

    let parts: CharRange[] = [];
    while (str[i] != "]") {
        let c = str[i];
        if (str[i + 1] == "-") {
            parts.push(CharRange.range(c, str[i + 2]));
            i += 3;
        } else {
            parts.push(CharRange.single(c));
            i++;
        }
    }

    return new CharClass(Set(parts), inverted);
}
