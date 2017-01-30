
import { parse, getAttrs } from "../src/parser";

let html = `<!-- a comment -->
                    <section id="main">
                    <!-- Other comment -->
                        <h1 class="title" data-m="value1">A title</h1>
                        <p>A <strong>content</strong> with a <a href="#">link</a></p>
                    </section>
                    <p>Other content</p>`;


let nodes = parse(html);
console.log(nodes);

let infos = nodes[1].children[0].infos;
console.log(html.substring(infos.index, infos.end));


/*let attrs = getAttrs("@attr=\"value\" :attr2=\"value2\"");
console.log(attrs)*/



