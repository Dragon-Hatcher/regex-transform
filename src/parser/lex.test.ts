import { Lexer, TokenType } from "./lex";

describe("lexer tests", () => {
    test("simple lexing", () => {
        let lexer = new Lexer("a(b?c)*d|e");
        let tokens = lexer.getTokens();

        expect(tokens.length).toBe(11);

        expect(tokens[0].type).toBe(TokenType.LITERAL);
        expect(tokens[1].type).toBe(TokenType.L_PAREN);
        expect(tokens[2].type).toBe(TokenType.LITERAL);
        expect(tokens[3].type).toBe(TokenType.QUESTION);
        expect(tokens[4].type).toBe(TokenType.LITERAL);
        expect(tokens[5].type).toBe(TokenType.R_PAREN);
        expect(tokens[6].type).toBe(TokenType.STAR);
        expect(tokens[7].type).toBe(TokenType.LITERAL);
        expect(tokens[8].type).toBe(TokenType.BAR);
        expect(tokens[9].type).toBe(TokenType.LITERAL);
        expect(tokens[10].type).toBe(TokenType.EOF);

        expect(lexer.getTokens()).toEqual(tokens);
    });
});
