import { Lexer } from "./lex";
import { ParseError, Parser } from "./parse";
import { PatternPrinter } from "./parse-tree";

describe("parser tests", () => {
    test("valid parsing", () => {
        let tokens = new Lexer("a(b?c)*d|e").getTokens();
        let tree = new Parser(tokens).parse();

        let printed = tree.accept(new PatternPrinter());
        expect(printed).toBe(
            `(alt (concat (lit 'a') (kleene (concat (alt (lit 'b') ε) (lit 'c'))) (lit 'd')) (lit 'e'))`,
        );
    });

    test("empty strings", () => {
        let tokens = new Lexer("|(a|)(|b)(|)").getTokens();
        let tree = new Parser(tokens).parse();

        let printed = tree.accept(new PatternPrinter());
        expect(printed).toBe(`(alt ε (concat (alt (lit 'a') ε) (alt ε (lit 'b')) (alt ε ε)))`);
    });

    test("multi postfix", () => {
        let tokens = new Lexer("a?**").getTokens();
        let tree = new Parser(tokens).parse();

        let printed = tree.accept(new PatternPrinter());
        expect(printed).toBe(`(kleene (kleene (alt (lit 'a') ε)))`);
    });

    test("parse errors", () => {
        let tokens = new Lexer("a(?)").getTokens();
        expect(() => new Parser(tokens).parse()).toThrow(ParseError);

        tokens = new Lexer("a(*)").getTokens();
        expect(() => new Parser(tokens).parse()).toThrow(ParseError);

        tokens = new Lexer("a(").getTokens();
        expect(() => new Parser(tokens).parse()).toThrow(ParseError);

        tokens = new Lexer("a())").getTokens();
        expect(() => new Parser(tokens).parse()).toThrow(ParseError);
    });
});
