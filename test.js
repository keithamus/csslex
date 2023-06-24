import { expect } from "@open-wc/testing";
import { lex, types, value } from "./mod.ts";

describe("lexer", () => {
  it("tokenizes comments", () => {
    expect(Array.from(lex("/* hello world */"))).to.eql([
      [types.COMMENT, 0, 17],
    ]);
    expect(Array.from(lex("/*x*y*z*/"))).to.eql([[types.COMMENT, 0, 9]]);
    expect(Array.from(lex("/**/ "))).to.eql([
      [types.COMMENT, 0, 4],
      [types.WHITESPACE, 4, 5],
    ]);
    expect(Array.from(lex("/*x*//*y*//*z*/"))).to.eql([
      [types.COMMENT, 0, 5],
      [types.COMMENT, 5, 10],
      [types.COMMENT, 10, 15],
    ]);
  });

  it("tokenizes newlines", () => {
    expect(Array.from(lex("\r\n"))).to.eql([[types.WHITESPACE, 0, 2]]);
    expect(Array.from(lex("\n\r"))).to.eql([[types.WHITESPACE, 0, 2]]);
  });

  it("tokenizes whitespace", () => {
    expect(Array.from(lex(" "))).to.eql([[types.WHITESPACE, 0, 1]]);
    expect(Array.from(lex("\t"))).to.eql([[types.WHITESPACE, 0, 1]]);
    expect(Array.from(lex("\t \t \t"))).to.eql([[types.WHITESPACE, 0, 5]]);
  });

  it("tokenizes idents", () => {
    expect(Array.from(lex("a"))).to.eql([[types.IDENT, 0, 1]]);
    expect(value("a", [types.IDENT, 0, 1])).to.eql("a");
    expect(Array.from(lex("a-9"))).to.eql([[types.IDENT, 0, 3]]);
    expect(value("a-9", [types.IDENT, 0, 3])).to.eql("a-9");
    expect(Array.from(lex("--"))).to.eql([[types.IDENT, 0, 2]]);
    expect(value("--", [types.IDENT, 0, 2])).to.eql("--");
  });

  it("tokenizes unterminated strings", () => {
    let err;
    const str = '"hello';
    expect(Array.from(lex(str))).to.eql([[types.STRING, 0, 6]]);
    expect(value(str, [types.STRING, 0, 6])).to.eql("hello");
  });

  it("tokenizes unterminated strings", () => {
    const str = '"hello\n"';
    expect(Array.from(lex(str))).to.eql([
      [types.BAD_STRING, 0, 6],
      [types.WHITESPACE, 6, 7],
      [types.STRING, 7, 8],
    ]);
    expect(value(str, [types.STRING, 7, 8])).to.eql("");
  });

  it("tokenizes functions", () => {
    const str = `calc(-infinity)`;
    expect(Array.from(lex(str))).to.eql([
      [types.FUNCTION, 0, 5],
      [types.IDENT, 5, 14],
      [types.RIGHT_PAREN, 14, 15],
    ]);
    expect(value(str, [types.FUNCTION, 0, 5])).to.eql("calc");
    expect(value(str, [types.IDENT, 5, 14])).to.eql(`-infinity`);
  });

  it("tokenizes functions with strings", () => {
    const str = `url("foo")`;
    expect(Array.from(lex(str))).to.eql([
      [types.FUNCTION, 0, 4],
      [types.STRING, 4, 9],
      [types.RIGHT_PAREN, 9, 10],
    ]);
    expect(value(str, [types.FUNCTION, 0, 4])).to.eql("url");
    expect(value(str, [types.STRING, 4, 9])).to.eql(`foo`);
  });

  it("tokenizes functions with strings in strings", () => {
    const str = `url("filter='url(%23a)'")`;
    expect(Array.from(lex(str))).to.eql([
      [types.FUNCTION, 0, 4],
      [types.STRING, 4, 24],
      [types.RIGHT_PAREN, 24, 25],
    ]);
    expect(value(str, [types.FUNCTION, 0, 4])).to.eql("url");
    expect(value(str, [types.STRING, 4, 24])).to.eql(`filter='url(%23a)'`);
  });

  it("tokenizes numbers", () => {
    expect(Array.from(lex("98")), "98").to.eql([[types.NUMBER, 0, 2]]);
    expect(value("98", [types.NUMBER, 0, 2])).to.eql({
      type: "integer",
      value: 98,
    });
    expect(Array.from(lex("100.00"))).to.eql([[types.NUMBER, 0, 6]]);
    expect(value("100.00", [types.NUMBER, 0, 6])).to.eql({
      type: "number",
      value: 100,
    });
    expect(Array.from(lex("100.00e-10"))).to.eql([[types.NUMBER, 0, 10]]);
    expect(value("100.00e-10", [types.NUMBER, 0, 10])).to.eql({
      type: "number",
      value: 1e-8,
    });
    expect(Array.from(lex("-0\n"))).to.eql([
      [types.NUMBER, 0, 2],
      [types.WHITESPACE, 2, 3],
    ]);
    expect(value("-0\n", [types.NUMBER, 0, 2])).to.eql({
      type: "integer",
      value: 0,
    });
  });

  it("tokenizes using codepoints not charcodes", () => {
    expect(Array.from(lex("§")), "§").to.eql([[types.DELIM, 0, 1]]);
    expect(value("§", [types.DELIM, 0, 1])).to.eql("§");
    expect(Array.from(lex("🤲🏽")), "🤲🏽").to.eql([[types.IDENT, 0, 4]]);
    expect(value("🤲🏽", [types.IDENT, 0, 4])).to.eql("🤲🏽");
    expect(Array.from(lex("café")), "café").to.eql([[types.IDENT, 0, 5]]);
    expect(value("café", [types.IDENT, 0, 5])).to.eql("café");
  });
});
