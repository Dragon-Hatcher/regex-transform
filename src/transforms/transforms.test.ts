import { RegularLanguage } from "../language";
import { RegexPatternPrinter } from "../regex-comp/parse-tree";

describe("test transforms", () => {
    test("test invert", () => {
        let lang = RegularLanguage.fromRegexStr("(1(01*0)*1)*0(0|(1(01*0)*1)(1(01*0)*1)*0)*");
        let inverted = lang.invert();

        console.log(inverted.regex.accept(new RegexPatternPrinter()));
    });
});
