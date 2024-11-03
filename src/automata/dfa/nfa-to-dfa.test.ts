import { RegularLanguage } from "../../language";

describe("test nfa to dfa conversion", () => {
    test("test conversion", () => {
        let lang = RegularLanguage.fromRegexStr("abc");
        let dfa = lang.dfa;

        expect(dfa.matches("abc")).toBe(true);
        expect(dfa.matches("ab")).toBe(false);
        expect(dfa.matches("abcd")).toBe(false);
        expect(dfa.matches("")).toBe(false);

        lang = RegularLanguage.fromRegexStr("(ab)*(c|d)");
        dfa = lang.dfa;

        expect(dfa.matches("abc")).toBe(true);
        expect(dfa.matches("abd")).toBe(true);
        expect(dfa.matches("c")).toBe(true);
        expect(dfa.matches("d")).toBe(true);
        expect(dfa.matches("abababc")).toBe(true);
        expect(dfa.matches("abababababd")).toBe(true);
        expect(dfa.matches("ab")).toBe(false);
        expect(dfa.matches("aad")).toBe(false);

        lang = RegularLanguage.fromRegexStr("(foo?)*");
        dfa = lang.dfa;

        expect(dfa.matches("foo")).toBe(true);
        expect(dfa.matches("fo")).toBe(true);
        expect(dfa.matches("fofoofofofoo")).toBe(true);
        expect(dfa.matches("")).toBe(true);
        expect(dfa.matches("ffoofofofoo")).toBe(false);
    });
});
