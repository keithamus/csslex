import Benchmark from "benchmark";
import { tokenize as tokenizer1 } from "./mod.js";
import { tokenizer as tokenizer2, TokenType } from "@csstools/css-tokenizer";
import { tokenize as tokenizer3 } from "css-tree";
import { readFileSync } from "node:fs";

const tokenizers = ["csslex", "@csstools/css-tokenizer", "css-tree"];

function tokenize(name, source) {
  if (name === "csslex") {
    return Array.from(tokenizer1(source));
  } else if (name === "@csstools/css-tokenizer") {
    const result = [];
    const t = tokenizer2({
      css: source,
    });
    while (true) {
      const token = t.nextToken();
      if (token[0] === TokenType.EOF) {
        break;
      }
      result.push(token);
    }

    return result;
  } else if (name === "css-tree") {
    const result = [];
    tokenizer3(source, (token, start, end) => {
      result.push([token, start, end]);
    });
    return result;
  }
}

// Smoke check
tokenize(
  "csslex",
  readFileSync("./node_modules/open-props/open-props.min.css", "utf8")
);

function runSuite(name, file) {
  console.log(`Running ${name}`);
  const source = readFileSync(file, "utf8");
  const suite = new Benchmark.Suite();
  for (const tokenizer of tokenizers) {
    suite.add(`${tokenizer}`, function () {
      tokenize(tokenizer, source);
    });
  }
  return suite
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    .on("complete", function () {
      console.log("Fastest is " + this.filter("fastest").map("name"));
    })
    .run({ async: true });
}

runSuite("open-props.min.css", "./node_modules/open-props/open-props.min.css");
