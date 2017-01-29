
import { parse } from "../src/parser";

let html = `<!-- a comment -->
                    <section>
                        <h1>A title</h1>
                        <p>A <strong>content</strong> with a <a href="#">link</a></p>
                    </section>
                    <p>Other content</p>`;


let nodes = parse(html);
console.log(nodes);

let infos = nodes[1].children[0].infos;
console.log(html.substring(infos.index, infos.end));

