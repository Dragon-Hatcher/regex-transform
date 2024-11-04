import { CharClass } from "../automata/char-class";
import { Token, TokenType } from "./lex";
import {
    AlternationPattern,
    ConcatPattern,
    EmptyPattern,
    KleeneStarPattern,
    LiteralPattern,
    Pattern,
} from "./parse-tree";

export class ParseError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, ParseError.prototype);

        this.name = "ParseError";
    }
}

//
// The regex grammar we use:
//
// pattern       ::= alternation
//
// alternation   ::= concatenation ("|" concatenation)*
// concatenation ::= postfix*
// postfix       ::= atom ("*" | "?")*
// atom          ::= LITERAL
//                 | "(" pattern ")"
//

export class Parser {
    private tokens: Token[];
    private current = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): Pattern {
        let pattern = this.parsePattern();

        if (!this.isAtEnd()) {
            let token = this.pop();
            throw new ParseError(`Unexpected ${token.type}.`);
        }

        return pattern;
    }

    private parsePattern(): Pattern {
        return this.parseAlternation();
    }

    private parseAlternation(): Pattern {
        let pattern = this.parseConcatenation();

        while (this.match(TokenType.BAR)) {
            let next = this.parseConcatenation();
            pattern = new AlternationPattern(pattern, next);
        }

        return pattern;
    }

    private parseConcatenation(): Pattern {
        let patterns: Pattern[] = [];

        let next = this.parsePostfix();
        while (!(next instanceof EmptyPattern)) {
            patterns.push(next);
            next = this.parsePostfix();
        }

        if (patterns.length == 0) {
            return new EmptyPattern();
        }

        if (patterns.length == 1) {
            return patterns[0];
        }

        return new ConcatPattern(patterns);
    }

    private parsePostfix(): Pattern {
        let base = this.parseAtom();

        while (this.match(TokenType.STAR, TokenType.QUESTION)) {
            if (base instanceof EmptyPattern) {
                throw new ParseError("Nothing to repeat.");
            }

            switch (this.previous().type) {
                case TokenType.STAR:
                    base = new KleeneStarPattern(base);
                    break;
                case TokenType.QUESTION:
                    base = new AlternationPattern(base, new EmptyPattern());
                    break;
            }
        }

        return base;
    }

    private parseAtom(): Pattern {
        if (this.match(TokenType.LITERAL)) {
            return new LiteralPattern(CharClass.single(this.previous().literal));
        }

        if (this.match(TokenType.PERIOD)) {
            return new LiteralPattern(CharClass.universal());
        }

        if (this.match(TokenType.L_PAREN)) {
            let pattern = this.parsePattern();
            this.consume(TokenType.R_PAREN);
            return pattern;
        }

        return new EmptyPattern();
    }

    private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private pop(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type == type;
    }

    private match(...types: TokenType[]): boolean {
        for (let type of types) {
            if (this.check(type)) {
                this.pop();
                return true;
            }
        }

        return false;
    }

    private consume(type: TokenType): Token {
        if (this.check(type)) return this.pop();

        throw new ParseError(`Expected token ${type}.`);
    }
}
