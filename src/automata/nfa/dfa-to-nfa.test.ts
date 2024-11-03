import { RegularLanguage } from "../../language";
import { dfaToNFA } from "./dfa-to-nfa";

describe("test dfa to nfa conversion", () => {
    test("test conversion", () => {
        let lang = RegularLanguage.fromRegexStr("abc");
        let dfa = lang.dfa;
        let nfa = dfaToNFA(dfa);

        expect(nfa.matches("abc")).toBe(true);
        expect(nfa.matches("ab")).toBe(false);
        expect(nfa.matches("abcd")).toBe(false);
        expect(nfa.matches("")).toBe(false);

        lang = RegularLanguage.fromRegexStr("(ab)*(c|d)");
        dfa = lang.dfa;
        nfa = dfaToNFA(dfa);

        expect(nfa.matches("abc")).toBe(true);
        expect(nfa.matches("abd")).toBe(true);
        expect(nfa.matches("c")).toBe(true);
        expect(nfa.matches("d")).toBe(true);
        expect(nfa.matches("abababc")).toBe(true);
        expect(nfa.matches("abababababd")).toBe(true);
        expect(nfa.matches("ab")).toBe(false);
        expect(nfa.matches("aad")).toBe(false);

        lang = RegularLanguage.fromRegexStr("(foo?)*");
        dfa = lang.dfa;
        nfa = dfaToNFA(dfa);

        expect(nfa.matches("foo")).toBe(true);
        expect(nfa.matches("fo")).toBe(true);
        expect(nfa.matches("fofoofofofoo")).toBe(true);
        expect(nfa.matches("")).toBe(true);
        expect(nfa.matches("ffoofofofoo")).toBe(false);
    });
});
