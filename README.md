# TypeScript/JavaScript HTML Parser

## Installation

```
npm i htmlparser -S
```

## Usage

### TypeScript / es6

```js
import { parse } from "html-parser";

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
<script src="/node_modules/html-parser/html-parser.js"></script>
<script>
       let html = `<!-- a comment -->
                    <section>
                        <h1>A title</h1>
                        <p>A <strong>content</strong> with a <a href="#">Link</a></p>
                    </section>
                    <p>Other content</p>`;
        var nodes = HTMLParser.parse(html);
        console.log(nodes);

        // link infos
        let infos = nodes[1].children[1].children[1].infos;
        console.log(html.substring(infos.index, infos.end));
</script>
```
