# @stackline/remark-retext

> remark plugin to support retext.

[![npm version](https://img.shields.io/npm/v/@stackline/remark-retext.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/remark-retext)
[![license](https://img.shields.io/npm/l/@stackline/remark-retext.svg?style=flat-square)](https://github.com/alexandroit/stackline-remark-retext)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fstackline-remark-retext-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-remark-retext)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/remark-retext/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/remark-retext/)** | **[npm](https://www.npmjs.com/package/@stackline/remark-retext)** | **[Issues](https://github.com/alexandroit/stackline-remark-retext/issues)** | **[Repository](https://github.com/alexandroit/stackline-remark-retext)**

**Current package version:** `1.0.1`

---

## Why this package?

`@stackline/remark-retext` is the Stackline-maintained distribution of `remark-retext@5.0.1`. It is an independent continuation of [remark-retext](https://github.com/remarkjs/remark-retext); original authors and licenses remain credited below.

## Compatibility

| Item | Value |
| :--- | :--- |
| Package | `@stackline/remark-retext@1.0.1` |
| API target | `remark-retext@5.0.1` |
| Supported Node.js | `See supported framework requirements` |
| License | `MIT` |
| Module type | `module` |
| Main entry | `index.js` |
| Types | `index.d.ts` |
| Runtime dependencies | `unified, @types/mdast, @types/unist, mdast-util-to-nlcst` |

## Installation

```bash
npm install @stackline/remark-retext
```

Preserve existing imports and plugin resolution with an npm alias:

```bash
npm install remark-retext@npm:@stackline/remark-retext
```

## Usage and API reference

### remark-retext


**[remark][]** plugin to support **[retext][]**.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`unified().use(remarkRetext, destination[, options])`](#unifieduseremarkretext-destination-options)
*   [Examples](#examples)
*   [Example: mutate mode](#example-mutate-mode)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Security](#security)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package is a [unified][] ([remark][]) plugin to support [retext][].

**unified** is a project that transforms content with abstract syntax trees
(ASTs).
**remark** adds support for markdown to unified.
**retext** adds support for natural language to unified.
**mdast** is the markdown AST that remark uses.
**nlcst** is the natural language AST that retext uses.
This is a remark plugin that transforms mdast into nlcst to support retext.

## When should I use this?

This project is useful if you want to check natural language in markdown.
The retext ecosystem has many useful plugins to check prose, such as
[`retext-indefinite-article`][retext-indefinite-article] which checks that `a`
and `an` are used correctly, or [`retext-readability`][retext-readability] which
checks that sentences are not too complex.
This plugins lets you use them on markdown documents.

This plugin is unfortunately not able to apply changes by retext plugins (such
as done by `retext-smartypants`) to the markdown content.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install @stackline/remark-retext
```

In Deno with [Skypack][]:

```js
import remarkRetext from 'https://cdn.skypack.dev/remark-retext@5?dts'
```

In browsers with [Skypack][]:

```html
<script type="module">
  import remarkRetext from 'https://cdn.skypack.dev/remark-retext@5?min'
</script>
```

## Use

Say we have the following file, `example.md`:

```markdown
## Hello guys!
```

And our script, `example.js`, looks as follows:

```js
import {read} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkRetext from '@stackline/remark-retext'
import retextEnglish from 'retext-english'
import retextEquality from 'retext-equality'

main()

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRetext, unified().use(retextEnglish).use(retextEquality))
    .use(remarkStringify)
    .process(await read('example.md'))

  console.error(reporter(file))
}
```

Now, running `node example` yields:

```text
example.md
  1:10-1:14  warning  `guys` may be insensitive, use `people`, `persons`, `folks` instead  gals-man  retext-equality

⚠ 1 warning
```

## API

This package exports no identifiers.
The default export is `remarkRetext`.

### `unified().use(remarkRetext, destination[, options])`

**[remark][]** plugin to support **[retext][]**.

##### `destination`

`destination` is either a parser or a processor.

*   If a destination [processor][] is given, runs the plugins attached to it
    with the new nlcst tree ([*bridge mode*][bridge]).
    This given processor must have a parser attached (this can be done by using
    the plugin `retext-english` or similar) and should use other retext plugins
*   If a parser is given, runs further plugins attached to the same processor
    with the new tree (*mutate mode*).
    Such parsers are exported by packages like `retext-english` as `Parser`.
    You should use other retext plugins after `remark-retext`.

##### `options`

Configuration (`Object`, optional).

###### `options.ignore`

List of [mdast][] node types to ignore (`Array.<string>`).
The types `'table'`, `'tableRow'`, and `'tableCell'` are always ignored.

###### `options.source`

List of [mdast][] node types to mark as [nlcst][] source nodes
(`Array.<string>`).
`'inlineCode'` is always marked as source.

## Examples

## Example: mutate mode

The previous example was using *bridge* mode: the markdown AST remained for
other plugins after `remark-retext`.
This example uses *mutate* mode: the markdown AST is discarded and the natural
language AST.
This is not very useful: this is not a good way to get the plain text version
of a markdown document.

```js
import {read} from 'to-vfile'
import {reporter} from 'vfile-reporter'
import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkRetext from '@stackline/remark-retext'
import {Parser} from 'retext-english'
import retextEquality from 'retext-equality'
import retextStringify from 'retext-stringify'

main()

async function main() {
  const file = await unified()
    .use(remarkParse)
    .use(remarkRetext, Parser)
    .use(retextEquality)
    .use(retextStringify)
    .process(await read('example.md'))

  console.error(reporter(file))
  console.log(String(file))
}
```

…yields:

```txt
example.md
  1:10-1:14  warning  `guys` may be insensitive, use `people`, `persons`, `folks` instead  gals-man  retext-equality

⚠ 1 warning
```

```txt
Hello guys!
```

## Types

This package is fully typed with [TypeScript][].
It exports an `Options` type, which specifies the interface of the accepted
options.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `unified` version 6+, `remark` version 3+, and `retext`
version 7+.

## Security

Use of `remark-retext` does not involve [**rehype**][rehype] ([**hast**][hast])
or user content so there are no openings for [cross-site scripting (XSS)][xss]
attacks.

## Related

*   [`rehype-retext`](https://github.com/rehypejs/rehype-retext)
    — Transform HTML ([hast][]) to natural language ([nlcst][])
*   [`remark-rehype`](https://github.com/remarkjs/remark-rehype)
    — Transform Markdown ([mdast][]) to HTML ([hast][])
*   [`rehype-remark`](https://github.com/rehypejs/rehype-remark)
    — Transform HTML ([hast][]) to Markdown ([mdast][])
*   [`mdast-util-to-nlcst`][to-nlcst]
    — Underlying algorithm

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]



[build-badge]: https://github.com/remarkjs/remark-retext/workflows/main/badge.svg

[build]: https://github.com/remarkjs/remark-retext/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-retext.svg

[coverage]: https://codecov.io/github/remarkjs/remark-retext

[downloads-badge]: https://img.shields.io/npm/dm/remark-retext.svg

[downloads]: https://www.npmjs.com/package/remark-retext

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-retext.svg

[size]: https://bundlephobia.com/result?p=remark-retext

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[skypack]: https://www.skypack.dev

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[remark]: https://github.com/remarkjs/remark

[retext]: https://github.com/retextjs/retext

[unified]: https://github.com/unifiedjs/unified

[processor]: https://github.com/unifiedjs/unified#processor

[bridge]: https://github.com/unifiedjs/unified#processing-between-syntaxes

[mdast]: https://github.com/syntax-tree/mdast

[nlcst]: https://github.com/syntax-tree/nlcst

[hast]: https://github.com/syntax-tree/hast

[to-nlcst]: https://github.com/syntax-tree/mdast-util-to-nlcst

[typescript]: https://www.typescriptlang.org

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[rehype]: https://github.com/rehypejs/rehype

[retext-indefinite-article]: https://github.com/retextjs/retext-indefinite-article

[retext-readability]: https://github.com/retextjs/retext-readability

## Credits and original authors

- Original project: [remark-retext](https://github.com/remarkjs/remark-retext).
- Titus Wormer.
- Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
