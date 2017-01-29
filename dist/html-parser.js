/*!
 * HTML Parser v0.1.1
 * (c) 2017 romagny13
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.HTMLParser = factory());
}(this, (function () { 'use strict';

var globalIndex = 0;
function getAttr(value) {
    var match = /([a-zA-Z0-9_\-@:]+)=(?:\"([^"]*)\")?/.exec(value);
    if (match) {
        return {
            name: match[1],
            value: match[2]
        };
    }
}
function getAttrs(value) {
    var attrs = [];
    var matches = value.match(new RegExp("([a-zA-Z0-9_\\-\\@\\:]+=(?:\"[^\"]*\")?)", "g"));
    if (matches) {
        for (var i = 0; i < matches.length; i++) {
            var attr = getAttr(matches[i]);
            if (attr) {
                attrs.push(attr);
            }
        }
    }
    return attrs;
}
function isComment(tokenString) {
    return tokenString.indexOf("<!--") === 0;
}
function findStartNodeOrComment(html, globalIndex) {
    var match = /<(\w+)\s*([^>]*)>|<!--(?:[^-->]|[\r\n])*-->/.exec(html);
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
                attrs: getAttrs(match[2]),
                children: [],
                innerHTML: "",
                infos: infos
            };
        }
    }
}
function findEndNode(html, tagName, globalIndex) {
    var level = 0;
    // find token (open or close) of this name
    var regex = new RegExp("<\/" + tagName + ">|<" + tagName + "\\s*(?:[^>]*)>", "g");
    function moveNext() {
        var match = regex.exec(html);
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
                    var matchText = match[0];
                    var infos = {
                        index: globalIndex + match.index,
                        end: globalIndex + match.index + matchText.length
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
    }
    return moveNext();
}
function isCloseToken(value) {
    return value.indexOf("</") === 0;
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
                // let rightHtml = html.substring(node.infos.end);
                var endNode_1 = findEndNode(toParse, node.name, globalIndex);
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
                else {
                    // node without end token(<meta > for example)
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
