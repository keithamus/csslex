import { expect } from "@open-wc/testing";
import {
  getSnapshot,
  getSnapshotConfig,
  saveSnapshot,
} from "@web/test-runner-commands";
import { lex, types, value } from "./mod.ts";

async function assertTokenSnapshot(name, css) {
  let snapshot = await getSnapshot({ name });
  let current = null;
  try {
    // These need b64 encoding due to poor escaping
    current = JSON.parse(atob(snapshot) || "null");
  } catch {}
  const { updateSnapshots } = await getSnapshotConfig();
  const actual = Array.from(lex(css)).map((tok) => [...tok, value(css, tok)]);
  if (updateSnapshots) {
    current = actual;
    await saveSnapshot({ name, content: btoa(JSON.stringify(current)) });
  }
  expect(current).to.exist.and.eql(actual);
}

describe("postcss-parser-tests", async () => {
  const files = [
    "apply.css",
    "at-rule-brackets.css",
    "atrule-decls.css",
    "atrule-empty.css",
    "atrule-no-params.css",
    "atrule-no-semicolon.css",
    "atrule-no-space.css",
    "atrule-params.css",
    "atrule-rules.css",
    "between.css",
    "colon-selector.css",
    "comments.css",
    "custom-properties.css",
    "decls.css",
    "empty.css",
    "escape.css",
    "extends.css",
    "function.css",
    "ie-progid.css",
    "important.css",
    "inside.css",
    "no-selector.css",
    "prop.css",
    "quotes.css",
    "raw-decl.css",
    "rule-at.css",
    "rule-no-semicolon.css",
    "selector.css",
    "semicolons.css",
    "tab.css",
  ];

  for (const file of files) {
    it(file, async () => {
      const res = await fetch(`/css/postcss-parser-tests/${file}`);
      const css = await res.text();
      await assertTokenSnapshot(`postcss-parser-tests/${file}`, css);
    });
  }
});

describe("open-props", async () => {
  const files = [
    "animations.min.css",
    "animations.shadow.min.css",
    "aspects.min.css",
    "aspects.shadow.min.css",
    "blue-hsl.min.css",
    "blue-hsl.shadow.min.css",
    "blue.min.css",
    "blue.shadow.min.css",
    "borders.min.css",
    "borders.shadow.min.css",
    "brown-hsl.min.css",
    "brown-hsl.shadow.min.css",
    "brown.min.css",
    "brown.shadow.min.css",
    "buttons.dark.min.css",
    "buttons.light.min.css",
    "buttons.min.css",
    "camo-hsl.min.css",
    "camo-hsl.shadow.min.css",
    "camo.min.css",
    "camo.shadow.min.css",
    "choco-hsl.min.css",
    "choco-hsl.shadow.min.css",
    "choco.min.css",
    "choco.shadow.min.css",
    "colors-hsl.min.css",
    "colors-hsl.shadow.min.css",
    "colors-oklch.min.css",
    "colors-oklch.shadow.min.css",
    "colors.min.css",
    "colors.shadow.min.css",
    "cyan-hsl.min.css",
    "cyan-hsl.shadow.min.css",
    "cyan.min.css",
    "cyan.shadow.min.css",
    "easings.min.css",
    "easings.shadow.min.css",
    "fonts.min.css",
    "fonts.shadow.min.css",
    "gradients.min.css",
    "gradients.shadow.min.css",
    "gray-hsl.min.css",
    "gray-hsl.shadow.min.css",
    "gray-oklch.min.css",
    "gray-oklch.shadow.min.css",
    "gray.min.css",
    "gray.shadow.min.css",
    "green-hsl.min.css",
    "green-hsl.shadow.min.css",
    "green.min.css",
    "green.shadow.min.css",
    "indigo-hsl.min.css",
    "indigo-hsl.shadow.min.css",
    "indigo.min.css",
    "indigo.shadow.min.css",
    "jungle-hsl.min.css",
    "jungle-hsl.shadow.min.css",
    "jungle.min.css",
    "jungle.shadow.min.css",
    "lime-hsl.min.css",
    "lime-hsl.shadow.min.css",
    "lime.min.css",
    "lime.shadow.min.css",
    "masks.corner-cuts.min.css",
    "masks.edges.min.css",
    "media.min.css",
    "normalize.dark.min.css",
    "normalize.light.min.css",
    "normalize.min.css",
    "normalize.shadow.min.css",
    "oklch-hues.min.css",
    "oklch-hues.shadow.min.css",
    "open-props.min.css",
    "open-props.shadow.min.css",
    "orange-hsl.min.css",
    "orange-hsl.shadow.min.css",
    "orange.min.css",
    "orange.shadow.min.css",
    "pink-hsl.min.css",
    "pink-hsl.shadow.min.css",
    "pink.min.css",
    "pink.shadow.min.css",
    "purple-hsl.min.css",
    "purple-hsl.shadow.min.css",
    "purple.min.css",
    "purple.shadow.min.css",
    "red-hsl.min.css",
    "red-hsl.shadow.min.css",
    "red.min.css",
    "red.shadow.min.css",
    "sand-hsl.min.css",
    "sand-hsl.shadow.min.css",
    "sand.min.css",
    "sand.shadow.min.css",
    "shadows.min.css",
    "shadows.shadow.min.css",
    "sizes.min.css",
    "sizes.shadow.min.css",
    "stone-hsl.min.css",
    "stone-hsl.shadow.min.css",
    "stone.min.css",
    "stone.shadow.min.css",
    "supports.min.css",
    "teal-hsl.min.css",
    "teal-hsl.shadow.min.css",
    "teal.min.css",
    "teal.shadow.min.css",
    "theme.dark.switch.min.css",
    "theme.light.switch.min.css",
    "violet-hsl.min.css",
    "violet-hsl.shadow.min.css",
    "violet.min.css",
    "violet.shadow.min.css",
    "yellow-hsl.min.css",
    "yellow-hsl.shadow.min.css",
    "yellow.min.css",
    "yellow.shadow.min.css",
    "zindex.min.css",
    "zindex.shadow.min.css",
  ];

  for (const file of files) {
    it(file, async () => {
      const res = await fetch(`/css/open-props/${file}`);
      const css = await res.text();
      await assertTokenSnapshot(`open-props/${file}`, css);
    });
  }
});
