import { expect } from "@open-wc/testing";
import { lex, types, value } from "./mod.ts";
import { testCorpus } from "@rmenke/css-tokenizer-tests";

const removeType = obj => { delete obj.type; return obj }

describe("@rmenke/css-tokenizer-tests", () => {
  const typesMap = {
    1: "comment",
    2: "ident-token",
    3: "function-token",
    4: "at-keyword-token",
    5: "hash-token",
    6: "string-token",
    7: "bad-string-token",
    8: "url-token",
    9: "bad-url-token",
    10: "delim-token",
    11: "number-token",
    12: "percentage-token",
    13: "dimension-token",
    14: "whitespace-token",
    15: "CDO-token",
    16: "CDC-token",
    17: "colon-token",
    18: "semicolon-token",
    19: "comma-token",
    20: "[-token",
    21: "]-token",
    22: "(-token",
    23: ")-token",
    24: "{-token",
    25: "}-token",
  };
  for (const test in testCorpus) {
    const { css, tokens } = testCorpus[test];
    it(`${test} ${JSON.stringify(css)}`, () => {
      expect(
        Array.from(lex(css)).map(([type, startIndex, endIndex]) => ({
          type: typesMap[type],
          startIndex,
          endIndex,
          raw: css.slice(startIndex, endIndex),
          structured:
            type === types.COMMENT
              ? null
              : type === types.PERCENTAGE
              ? removeType(value(css, [type, startIndex, endIndex]))
              : typeof value(css, [type, startIndex, endIndex]) !== "object"
              ? {
                  value: value(css, [type, startIndex, endIndex]),
                }
              : value(css, [type, startIndex, endIndex]),
        }))
      ).to.eql(tokens);
    });
  }
});
