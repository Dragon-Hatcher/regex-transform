export const TokenType = {
    LITERAL: "LITERAL",
    L_PAREN: "L_PAREN",
    R_PAREN: "R_PAREN",
    BAR: "BAR",
    STAR: "STAR",
    QUESTION: "QUESTION",
    PERIOD: "PERIOD",
    EOF: "EOF",
} as const;
export type TokenType = (typeof TokenType)[keyof typeof TokenType];

export class Token {
    private _type: TokenType;
    private _literal: string | null;

    constructor(type: TokenType, literal: string | null) {
        this._type = type;
        this._literal = literal;
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

    public get literal(): string {
        return this._literal!;
    }
}

export class Lexer {
    private source: string;
    private position: number = 0;

    private tokens: Token[] = [];

    constructor(source: string) {
        this.source = source;
    }

    public getTokens(): Token[] {
        while (!this.isEOF()) {
            let token = this.pop();
            this.tokens.push(token!);
        }

        if (this.tokens.length == 0 || this.tokens[this.tokens.length - 1].type != TokenType.EOF) {
            this.tokens.push(Token.of(TokenType.EOF));
        }

        return this.tokens;
    }

    private isEOF(): boolean {
        return this.position >= this.source.length;
    }

    private pop(): Token | null {
        let char = this.source[this.position++];

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
            case ".":
                return Token.of(TokenType.PERIOD);
            default:
                return Token.literal(char);
        }
    }
}
