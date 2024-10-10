import { NFA } from "./automata/nfa/nfa";
import { regexToNFA } from "./automata/nfa/regex-to-nfa";
import { compileRegex } from "./regex-comp/compile";
import { Pattern } from "./regex-comp/parse-tree";

export class RegularLanguage {
    private _nfa: NFA | null = null;
    private _regex: Pattern | null = null;

    static fromNFA(nfa: NFA): RegularLanguage {
        let lang = new RegularLanguage();
        lang._nfa = nfa;
        return lang;
    }

    static fromRegex(regex: Pattern): RegularLanguage {
        let lang = new RegularLanguage();
        lang._regex = regex;
        return lang;
    }

    static fromRegexStr(source: string): RegularLanguage {
        return compileRegex(source);
    }

    public get nfa(): NFA {
        if (this._nfa == null) {
            this._nfa = regexToNFA(this.regex);
        }

        return this._nfa;
    }

    public get regex(): Pattern {
        if (this._regex == null) {
            throw Error("TODO: NFA to Regex");
        }

        return this._regex;
    }

    public matches(str: string): boolean {
        return this.nfa.matches(str);
    }
}
