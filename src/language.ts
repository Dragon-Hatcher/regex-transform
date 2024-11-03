import { DFA } from "./automata/dfa/dfa";
import { nfaToDFA } from "./automata/dfa/nfa-to-dfa";
import { dfaToNFA } from "./automata/nfa/dfa-to-nfa";
import { NFA } from "./automata/nfa/nfa";
import { nfaToRegex } from "./automata/nfa/nfa-to-regex";
import { regexToNFA } from "./automata/nfa/regex-to-nfa";
import { compileRegex } from "./regex-comp/compile";
import { Pattern } from "./regex-comp/parse-tree";

export class RegularLanguage {
    private _dfa: DFA | null = null;
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

    public get dfa(): DFA {
        if (this._dfa == null) {
            this._dfa = nfaToDFA(this.nfa);
        }

        return this._dfa;
    }

    public get nfa(): NFA {
        if (this._nfa == null) {
            this._nfa = this._regex != null ? regexToNFA(this.regex) : dfaToNFA(this.dfa);
        }

        return this._nfa;
    }

    public get regex(): Pattern {
        if (this._regex == null) {
            this._regex = nfaToRegex(this.nfa);
        }

        return this._regex;
    }

    public matches(str: string): boolean {
        return this._dfa != null ? this.dfa.matches(str) : this.nfa.matches(str);
    }
}
