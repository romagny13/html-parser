let globalIndex = 0;
let attrRE = /(\w*(?::|@))?([a-zA-Z0-9_\-]+)(?:=\"([^"]*)\")?/;
let openRE = /<(\w+)\s*([^>]*)>|<!--(?:[^-->]|[\r\n])*-->/;

function getAttr(value: string): any {
    let match = attrRE.exec(value);
    if (match) {
        return {
            prefix: match[1],
            name: match[2],
            value: match[3]
        };
    }
}

function getAttrs(value: string): any {
    let attrs = [];
    let matches = value.match(new RegExp(attrRE.source, "g"));
    if (matches) {
        for (let i = 0; i < matches.length; i++) {
            let attr = getAttr(matches[i]);
            if (attr) {
                attrs.push(attr);
            }
        }
    }
    return attrs;
}

function isComment(tokenString: string): boolean {
    return tokenString.indexOf("<!--") === 0;
}

function findStartNodeOrComment(html: string, globalIndex: number): any {
    let match = openRE.exec(html);
    if (match) {
        let matchText = match[0];
        let infos = {
            index: globalIndex + match.index,
            end: globalIndex + match.index + matchText.length
        };
        if (isComment(matchText)) {
            return {
                type: "comment",
                match: matchText,
                infos
            };
        }
        else {
            // open
            return {
                type: "token",
                match: matchText,
                name: match[1],
                attrs: getAttrs(match[2]),
                children: [],
                innerHTML: "",
                infos
            };
        }
    }
}

function findEndNode(html: string, tagName: string, globalIndex: number): any {
    let level = 0;
    // find token (open or close) of this name
    let regex = new RegExp("<\/" + tagName + ">|<" + tagName + "\\s*(?:[^>]*)>", "g");

    function moveNext() {
        let match = regex.exec(html);
        if (match) {
            if (!isCloseToken(match[0])) {
                level++;
                return moveNext();
            }
            else {
                level--;
                if (level > 0) {
                    return moveNext();
                }
                else {
                    // return node
                    let matchText = match[0];
                    return {
                        type: "close",
                        match: matchText,
                        name: tagName,
                        infos: {
                            index: globalIndex + match.index,
                            end: globalIndex + match.index + matchText.length
                        }
                    };
                }
            }
        }
    }
    return moveNext();
}

function isCloseToken(value: string): boolean {
    return value.indexOf("</") === 0;
}

function hasToken(value: string): boolean {
    return /<\/\w+>/.test(value);
}

function findNextNode(html: string, parent: any, next?: Function): void {

    function moveNext() {
        // right html from current global index
        let toParse = html.substring(globalIndex);
        let node = findStartNodeOrComment(toParse, globalIndex);
        if (node) {
            if (node.type === "token") {
                parent.children.push(node);
                let endNode = findEndNode(toParse, node.name, globalIndex);
                if (endNode) {
                    // end of open node... to start of close node
                    let innerHTML = html.substring(node.infos.end, endNode.infos.index);
                    node.innerHTML = innerHTML;
                    if (hasToken(innerHTML)) {
                        // inner nodes
                        globalIndex = node.infos.end;
                        let leftHtml = html.substring(0, endNode.infos.index);
                        findNextNode(leftHtml, node, () => {
                            node.infos.end = endNode.infos.end;
                            globalIndex = endNode.infos.end;
                            moveNext();
                        });
                    }
                    else {
                        // text content
                        node.infos.end = endNode.infos.end;
                        globalIndex = endNode.infos.end;
                        moveNext();
                    }
                }
                else {
                    // node without end token (<meta> for example)
                    globalIndex = node.infos.end;
                    moveNext();
                }
            }
            else if (node.type === "comment") {
                parent.children.push(node);
                globalIndex = node.infos.end;
                moveNext();
            }
        }
        else {
            if (next) { next(); }
        }
    }
    moveNext();
}

function parse(html: string): Array<any> {
    let node = {
        name: "_",
        children: []
    };
    globalIndex = 0;
    findNextNode(html, node);
    return node.children;
}

export { getAttr, getAttrs, findStartNodeOrComment, findEndNode, parse };
