import { RegularLanguage } from "./language";

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
    });
});
