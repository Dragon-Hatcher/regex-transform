import { sayGoodbye, sayHello } from "./hello";

describe("say hello", () => {
    test("it says hello", () => {
        expect(sayHello()).toBe("hi");
    });

    test("it says goodbye", () => {
        expect(sayGoodbye()).toBe("goodbye");
    });
});
