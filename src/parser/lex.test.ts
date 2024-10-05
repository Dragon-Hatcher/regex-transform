import { Lexer, TokenType } from "./lex";

describe("lexer tests", () => {
    test("simple lexing", () => {
        let lexer = new Lexer("a(b?c)*d|e");

        expect(lexer.isEOF()).toBe(false);

        expect(lexer.peek().type).toBe(TokenType.LITERAL);
        expect(lexer.pop().type).toBe(TokenType.LITERAL);
        expect(lexer.pop().type).toBe(TokenType.L_PAREN);
        expect(lexer.pop().type).toBe(TokenType.LITERAL);
        expect(lexer.pop().type).toBe(TokenType.QUESTION);
        expect(lexer.pop().type).toBe(TokenType.LITERAL);
        expect(lexer.pop().type).toBe(TokenType.R_PAREN);
        expect(lexer.pop().type).toBe(TokenType.STAR);
        expect(lexer.pop().type).toBe(TokenType.LITERAL);
        expect(lexer.pop().type).toBe(TokenType.BAR);
        expect(lexer.peek().type).toBe(TokenType.LITERAL);

        expect(lexer.isEOF()).toBe(false);
        expect(lexer.pop().type).toBe(TokenType.LITERAL);

        expect(lexer.isEOF()).toBe(true);
        expect(lexer.peek()).toBe(null);
        expect(lexer.pop()).toBe(null);
    });
});
