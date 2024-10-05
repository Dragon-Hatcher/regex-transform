export const TokenType = {
    LITERAL: "LITERAL",
    L_PAREN: "L_PAREN",
    R_PAREN: "R_PAREN",
    BAR: "BAR",
    STAR: "STAR",
    QUESTION: "QUESTION",
} as const;
type TokenType = (typeof TokenType)[keyof typeof TokenType];

export class Token {
    private _type: TokenType;
    private literal: string | null;

    constructor(type: TokenType, literal: string | null) {
        this._type = type;
        this.literal = literal;
    }

    static of(type: TokenType): Token {
        return new Token(type, null);
    }

    static literal(char: string): Token {
        return new Token(TokenType.LITERAL, char);
    }

    public get type(): TokenType {
        return this._type;
    }
}

export class Lexer {
    private source: string;
    private position: number = 0;

    constructor(source: string) {
        this.source = source;
    }

    public isEOF(): boolean {
        return this.position >= this.source.length;
    }

    public peek(): Token | null {
        if (this.isEOF()) return null;

        let char = this.source[this.position];
        switch (char) {
            case "(":
                return Token.of(TokenType.L_PAREN);
            case ")":
                return Token.of(TokenType.R_PAREN);
            case "|":
                return Token.of(TokenType.BAR);
            case "*":
                return Token.of(TokenType.STAR);
            case "?":
                return Token.of(TokenType.QUESTION);

            default:
                return Token.literal(char);
        }
    }

    public pop(): Token | null {
        let token = this.peek();
        this.advance();
        return token;
    }

    advance() {
        this.position++;
    }
}
