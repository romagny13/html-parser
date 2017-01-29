/*!
 * HTML Parser v0.1.0
 * (c) 2017 romagny13
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.HTMLParser = factory());
}(this, (function () { 'use strict';

var globalIndex = 0;
function isComment(tokenString) {
    return tokenString.indexOf("<!--") === 0;
}
function findStartNodeOrComment(html, globalIndex) {
    var match = /<(\w+)\s*([^>]*)>|<!--(?:.|[\r\n])*-->/.exec(html);
    if (match) {
        var matchText = match[0];
        var infos = {
            index: globalIndex + match.index,
            end: globalIndex + match.index + matchText.length
        };
        if (isComment(matchText)) {
            return {
                type: "comment",
                match: matchText,
                infos: infos
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
                infos: infos
            };
        }
    }
}
function findEndNode(html, tagName, globalIndex) {
    /*
    --> "right html": example for "<div>content</content>" --> html  received is "content</div>"
    Example: "A content<p> with</p>a paragraph </p>"
    1. find first occurrence of </tag> (A content<p> with</p> <== )
    2. check if html between start and index of match end node have a tag with this name opened (A content<p> with)
    -> if have a token, move to the end of match end node (a paragraph </p>)
    -> else return this end node with infos (global index and global end), global index is 0 for example
    */
    var closeRE = new RegExp("<\/" + tagName + ">");
    var openRE = new RegExp("<" + tagName + "\\s*(?:[^>]*)>");
    function moveNext(lastIndex) {
        // find </tag>
        var rightHtml = html.substring(lastIndex);
        var match = closeRE.exec(rightHtml);
        if (match) {
            // check if no <tag> between start search and </tag>
            var leftHtmlSearch = rightHtml.substring(0, match.index);
            if (openRE.exec(leftHtmlSearch)) {
                var end = match.index + match[0].length;
                return moveNext(lastIndex + end);
            }
            else {
                var matchText = match[0];
                var infos = {
                    index: globalIndex + lastIndex + match.index,
                    end: globalIndex + lastIndex + match.index + matchText.length
                };
                var node = {
                    type: "close",
                    match: matchText,
                    name: tagName,
                    infos: infos
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
function findNextNode(html, parent, next) {
    function moveNext() {
        // right html from current global index
        var toParse = html.substring(globalIndex);
        var node = findStartNodeOrComment(toParse, globalIndex);
        if (node) {
            if (node.type === "token") {
                parent.children.push(node);
                // html from the end of matched open node
                var rightHtml = html.substring(node.infos.end);
                var endNode_1 = findEndNode(rightHtml, node.name, node.infos.end);
                if (endNode_1) {
                    // end of open node... to start of close node
                    var innerHTML = html.substring(node.infos.end, endNode_1.infos.index);
                    node.innerHTML = innerHTML;
                    if (hasToken(innerHTML)) {
                        // inner nodes
                        globalIndex = node.infos.end;
                        var leftHtml = html.substring(0, endNode_1.infos.index);
                        findNextNode(leftHtml, node, function () {
                            node.infos.end = endNode_1.infos.end;
                            globalIndex = endNode_1.infos.end;
                            moveNext();
                        });
                    }
                    else {
                        // text content
                        node.infos.end = endNode_1.infos.end;
                        globalIndex = endNode_1.infos.end;
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
            if (next) {
                next();
            }
        }
    }
    moveNext();
}
function parse(html) {
    var node = {
        name: "_",
        children: []
    };
    globalIndex = 0;
    findNextNode(html, node);
    return node.children;
}

var main = {
    parse: parse
};

return main;

})));
