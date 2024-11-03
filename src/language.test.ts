import { RegularLanguage } from "./language";
import { RegexPatternPrinter } from "./regex-comp/parse-tree";

describe("test regular language", () => {
    test("test matching", () => {
        let lang = RegularLanguage.fromRegexStr("abc");

        expect(lang.matches("abc")).toBe(true);
        expect(lang.matches("ab")).toBe(false);
        expect(lang.matches("abcd")).toBe(false);
        expect(lang.matches("")).toBe(false);

        lang = RegularLanguage.fromRegexStr("(ab)*(c|d)");

        expect(lang.matches("abc")).toBe(true);
        expect(lang.matches("abd")).toBe(true);
        expect(lang.matches("c")).toBe(true);
        expect(lang.matches("d")).toBe(true);
        expect(lang.matches("abababc")).toBe(true);
        expect(lang.matches("abababababd")).toBe(true);
        expect(lang.matches("ab")).toBe(false);
        expect(lang.matches("aad")).toBe(false);

        lang = RegularLanguage.fromRegexStr("(foo?)*");

        expect(lang.matches("foo")).toBe(true);
        expect(lang.matches("fo")).toBe(true);
        expect(lang.matches("fofoofofofoo")).toBe(true);
        expect(lang.matches("")).toBe(true);
        expect(lang.matches("ffoofofofoo")).toBe(false);

        lang = RegularLanguage.fromRegexStr("a*");

        expect(lang.matches("")).toBe(true);
        expect(lang.matches("a")).toBe(true);
        expect(lang.matches("aa")).toBe(true);
        expect(lang.matches("aaaaa")).toBe(true);
        expect(lang.matches("b")).toBe(false);
        expect(lang.matches("aab")).toBe(false);
        expect(lang.matches("aabaa")).toBe(false);
    });

    test("test dfa construction", () => {
        let lang = RegularLanguage.fromRegexStr("(abb*cc*)(abb*cc*)*");
        console.log(lang.dfa.prettyPrint());
    });

    test("test nfa to regex construction", () => {
        let lang1 = RegularLanguage.fromRegexStr("abc");
        let lang2 = RegularLanguage.fromNFA(lang1.nfa);
        console.log(lang2.regex.accept(new RegexPatternPrinter()));
    });
});
