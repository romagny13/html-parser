let globalIndex = 0;

function getAttr(value: string): any {
    let match = /([a-zA-Z0-9_-]+)=(?:\"([^"]*)\")?/.exec(value);
    if (match) {
        return {
            name: match[1],
            value: match[2]
        };
    }
}

function getAttrs(value: string): any {
    let attrs = {};
    let matches = value.match(new RegExp("([a-zA-Z0-9_-]+=(?:\"[^\"]*\")?)", "g"));
    if (matches) {
        for (let i = 0; i < matches.length; i++) {
            let attr = getAttr(matches[i]);
            if (attr) {
                attrs[attr.name] = attr.value;
            }
        }
    }
    return attrs;
}

function isComment(tokenString: string): boolean {
    return tokenString.indexOf("<!--") === 0;
}

function findStartNodeOrComment(html: string, globalIndex: number): any {
    let match = /<(\w+)\s*([^>]*)>|<!--(?:.|[\r\n])*-->/.exec(html);
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
                children: [],
                innerHTML: "",
                infos
            };
        }
    }
}

function findEndNode(html: string, tagName: string, globalIndex: number): any {
    /*
    --> "right html": example for "<div>content</content>" --> html  received is "content</div>"
    Example: "A content<p> with</p>a paragraph </p>"
    1. find first occurrence of </tag> (A content<p> with</p> <== )
    2. check if html between start and index of match end node have a tag with this name opened (A content<p> with)
    -> if have a token, move to the end of match end node (a paragraph </p>)
    -> else return this end node with infos (global index and global end), global index is 0 for example
    */
    let closeRE = new RegExp("<\/" + tagName + ">");
    let openRE = new RegExp("<" + tagName + "\\s*(?:[^>]*)>");

    function moveNext(lastIndex) {
        // find </tag>
        let rightHtml = html.substring(lastIndex);
        let match = closeRE.exec(rightHtml);
        if (match) {
            // check if no <tag> between start search and </tag>
            let leftHtmlSearch = rightHtml.substring(0, match.index);
            if (openRE.exec(leftHtmlSearch)) {
                let end = match.index + match[0].length;
                return moveNext(lastIndex + end);
            }
            else {
                let matchText = match[0];
                let infos = {
                    index: globalIndex + lastIndex + match.index,
                    end: globalIndex + lastIndex + match.index + matchText.length
                };
                let node = {
                    type: "close",
                    match: matchText,
                    name: tagName,
                    infos
                };
                return node;
            }
        }
    }
    return moveNext(0);
}

function hasToken(value) {
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
                // html from the end of matched open node
                let rightHtml = html.substring(node.infos.end);
                let endNode = findEndNode(rightHtml, node.name, node.infos.end);
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

function parse(html) {
    let node = {
        name: "_",
        children: []
    };
    globalIndex = 0;
    findNextNode(html, node);
    return node.children;
}


export { getAttr, getAttrs, findStartNodeOrComment, findEndNode, parse };
