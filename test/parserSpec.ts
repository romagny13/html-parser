import { assert } from "chai";
import { getAttr, getAttrs, findStartNodeOrComment, findEndNode, parse } from "../src/parser";

describe("Test", () => {

    it("Should get attr", () => {
        let attr = getAttr("attr1=\"value1\"");
        assert.equal(attr.name, "attr1");
        assert.equal(attr.value, "value1");
    });

    it("Should get attrs", () => {
        let attrs = getAttrs("attr1=\"value1\" attr2=\"value2\"");
        assert.equal(attrs[0].name, "attr1");
        assert.equal(attrs[0].value, "value1");
        assert.equal(attrs[1].name, "attr2");
        assert.equal(attrs[1].value, "value2");
    });

    it("Should find start node", () => {
        let p = findStartNodeOrComment("<p>my text</p>", 0);
        assert.equal(p.infos.index, 0);
        assert.equal(p.infos.end, 3);
        assert.equal(p.match, "<p>");
        assert.equal(p.name, "p");
    });

    it("Should find start node in middle of text", () => {
        let p = findStartNodeOrComment("my start <p>my text</p>", 0);
        assert.equal(p.infos.index, 9);
        assert.equal(p.infos.end, 12);
        assert.equal(p.match, "<p>");
        assert.equal(p.name, "p");
    });

    it("Should find end node", () => {
        // should find </p> after "with !"
        let p = findEndNode(`<p>A <p>content</p> with !</p>`, "p", 0);
        assert.equal(p.infos.index, 26);
        assert.equal(p.infos.end, 30);
        assert.equal(p.match, "</p>");
        assert.equal(p.name, "p");
    });

    it("Should find two nodes", () => {
        let nodes = parse(`<p1>content 1</p1><p2>content 2</p2>`);
        assert.equal(nodes.length, 2);
        assert.equal(nodes[0].name, "p1");
        assert.equal(nodes[0].innerHTML, "content 1");
        assert.equal(nodes[1].name, "p2");
        assert.equal(nodes[1].innerHTML, "content 2");
    });

    it("Should find comment", () => {
        let nodes = parse(`<!-- a comment --><p1>content 1</p1><p2>content 2</p2>`);
        assert.equal(nodes.length, 3);
        assert.equal(nodes[0].type, "comment");
        assert.equal(nodes[0].match, "<!-- a comment -->");
        assert.equal(nodes[1].name, "p1");
        assert.equal(nodes[1].innerHTML, "content 1");
        assert.equal(nodes[2].name, "p2");
        assert.equal(nodes[2].innerHTML, "content 2");
    });


    it("Should find multiline comment", () => {
        let nodes = parse(`<!--

        a comment

        --><p1>content 1</p1><p2>content 2</p2>`);
        assert.equal(nodes.length, 3);
        assert.equal(nodes[0].type, "comment");
        assert.equal(nodes[0].match, `<!--

        a comment

        -->`);
        assert.equal(nodes[1].name, "p1");
        assert.equal(nodes[1].innerHTML, "content 1");
        assert.equal(nodes[2].name, "p2");
        assert.equal(nodes[2].innerHTML, "content 2");
    });

    it("Should have infos", () => {
        let nodes = parse(`<p1>c1</p1><p2>c2</p2>`);
        let firstInfos = nodes[0].infos;
        let secondInfos = nodes[1].infos;

        assert.equal(firstInfos.index, 0);
        assert.equal(firstInfos.end, 11);
        assert.equal(secondInfos.index, 11);
        assert.equal(secondInfos.end, 22);
    });

    it("Should have child infos", () => {
        let nodes = parse(`<p1>c1<i>I</i></p1><p2>c2</p2>`);
        let firstInfos = nodes[0].infos;
        let innerInfos = nodes[0].children[0].infos;
        let secondInfos = nodes[1].infos;

        assert.equal(firstInfos.index, 0);
        //
        assert.equal(innerInfos.index, 6);
        assert.equal(innerInfos.end, 14);
        //
        assert.equal(firstInfos.end, 19);
        assert.equal(secondInfos.index, 19);
        assert.equal(secondInfos.end, 30);
    });


});
