import { RegularLanguage } from "../language";
import { Lexer } from "./lex";
import { Parser } from "./parse";

export function compileRegex(source: string): RegularLanguage {
    let tokens = new Lexer(source).getTokens();
    let parsed = new Parser(tokens).parse();
    return RegularLanguage.fromRegex(parsed);
}
