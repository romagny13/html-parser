# TypeScript/JavaScript HTML Parser

[![Build Status](https://travis-ci.org/romagny13/html-parser.svg?branch=master)](https://travis-ci.org/romagny13/html-parser)

<strong>HTML tree</strong> to  <strong>Object tree</strong>.

## Installation

```
npm i romagny13-html-parser -S
```

## Usage

### TypeScript / es6

```js
import { parse } from "romagny13-html-parser";

let html = `<!-- a comment -->
            <section>
                <h1>A title</h1>
                <p>A <strong>content</strong> with a <a href="#">Link</a></p>
            </section>
            <p>Other content</p>`;

let nodes = parse(html);
console.log(nodes);
```

### es5

```html
<script src="/node_modules/romagny13-html-parser/html-parser.js"></script>
<script>
    var html = '<!-- a comment --><section><h1>A title</h1><p>A <strong>content</strong> with a <a href="#">Link</a></p></section><p>Other content</p>';
    var nodes = HTMLParser.parse(html);
    console.log(nodes);

    // link infos
    var infos = nodes[1].children[1].children[1].infos;
    console.log(html.substring(infos.index, infos.end)); // show "<a href="#">Link</a>"
</script>
```
