var tokenTypes = [ // Terminal symbols
    newTokenType("ws",    "\\s+"),
    newTokenType("(",     "\\("),
    newTokenType(")",     "\\)"),
    newTokenType("+",     "\\+"),
    newTokenType("-",     "-"),
    newTokenType("*",     "\\*"),
    newTokenType("/",     "/"),
    newTokenType("%",     "%"),
    newTokenType("^",     "\\^"),
    newTokenType("real",  "\\d*\\.\\d+"),
    newTokenType("int",   "\\d+"),
    //newTokenType(",",     ","),
    //newTokenType("id",    "[a-zA-Z_]\\w*"),
    newTokenType("error", ".*")
];

var rules = [ // Non terminal symbols. Patterns are evaluated right to left
    newRule("EXPR", [
        newPattern(["EXPR", "+", "EXPR2_R+"],  function(nodes) {return nodes[0].val() + nodes[2].val();}),
        newPattern(["EXPR", "-", "EXPR2_R+"],  function(nodes) {return nodes[0].val() - nodes[2].val();}),
        newPattern(["EXPR", "ws"],             function(nodes) {return nodes[0].val();}),
        newPattern(["ws", "EXPR2"],            function(nodes) {return nodes[1].val();}),
        newPattern(["EXPR2"],                  function(nodes) {return nodes[0].val();})
    ]),
    newRule("EXPR2", [
        newPattern(["EXPR2", "*", "EXPR3"],    function(nodes) {return nodes[0].val() * nodes[2].val();}),
        newPattern(["EXPR2", "/", "EXPR3"],    function(nodes) {return nodes[0].val() / nodes[2].val();}),
        newPattern(["EXPR2", "%", "EXPR3"],    function(nodes) {return nodes[0].val() % nodes[2].val();}),
        newPattern(["EXPR3"],                  function(nodes) {return nodes[0].val();})
    ]),
    newRule("EXPR2_R+", [
        newPattern(["EXPR2_R+", "*", "EXPR3"], function(nodes) {return nodes[0].val() * nodes[2].val();}),
        newPattern(["EXPR2_R+", "/", "EXPR3"], function(nodes) {return nodes[0].val() / nodes[2].val();}),
        newPattern(["EXPR2_R+", "%", "EXPR3"], function(nodes) {return nodes[0].val() % nodes[2].val();}),
        newPattern(["EXPR3_R+"],               function(nodes) {return nodes[0].val();})
    ]),
    newRule("EXPR3", [
        newPattern(["EXPR3", "^", "EXPR4"],    function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        newPattern(["EXPR4"],                  function(nodes) {return nodes[0].val();})
    ]),
    newRule("EXPR3_R+", [
        newPattern(["EXPR3_R+", "^", "EXPR4"], function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        newPattern(["EXPR5"],                  function(nodes) {return nodes[0].val();})
    ]),
    newRule("EXPR4", [
        newPattern(["+", "EXPR5"],             function(nodes) {return nodes[1].val();}),
        newPattern(["-", "EXPR5"],             function(nodes) {return -nodes[1].val();}),
        newPattern(["EXPR5"],                  function(nodes) {return nodes[0].val();})
    ]),
    newRule("EXPR5", [
        newPattern(["(", "EXPR", ")"],         function(nodes) {return nodes[1].val();}),
        newPattern(["NUM"],                    function(nodes) {return nodes[0].val();})
    ]),
    newRule("NUM", [
        newPattern(["int"],                    function(nodes) {return parseInt(nodes[0].val());}),
        newPattern(["real"],                   function(nodes) {return parseFloat(nodes[0].val());})
    ])
];

function newTokenType(id, regexStr) {
    return {
        id: id,
        regexStr: regexStr,
        regex: new RegExp("^" + regexStr)
    };
};

function newToken(id, pos, content) {
    return {
        id: id,
        pos: pos,
        content: content
    };
};

function newRule(id, patterns) {
    return {
        id: id,
        patterns: patterns,
        getParseTree: function(tokens, tokensUsed) {
            for(var i = 0 ; i < patterns.length ; i++) {
                var parseTree = patterns[i].getParseTree(tokens, tokensUsed);
                if(parseTree !== null) {
                    parseTree.id = id;
                    return parseTree;
                }
            }
            return null;
        }
    };
};

function newPattern(elements, action) {
    return {
        elements: elements,
        action: action,
        getParseTree: function(tokens, tokensUsed) {
            var children = [];
            var remainingTokens = tokens.length - tokensUsed;
            var remainingElements = elements.length;
            
            while(remainingTokens > 0 && remainingElements > 0) { // Evaluates each element right to left
                remainingElements--;
                var node = null;
                
                if(elements[remainingElements] === tokens[remainingTokens-1].id) // Checks if current element is terminal
                    node = newParseTreeTerminalNode(tokens[remainingTokens-1]);
                else for(var j = 0 ; j < rules.length ; j++) { // Checks if current element is non terminal
                    if(elements[remainingElements] === rules[j].id) {
                        node = rules[j].getParseTree(tokens, tokens.length - remainingTokens);
                        break;
                    }
                }
                
                if(node === null) { // Element not found
                    return null;
                }
                children.unshift(node); // Element found
                remainingTokens -= node.tokensUsed();
                node = null;
            }
            if(remainingElements > 0)
                return null;
            return newParseTreeNode(children, action);
        },
        getPatternString: function() {
            return "[" + elements.join(" ") + "]";
        }
    };
}

function newParseTreeNode(children, action) {
    return {
        id: "",
        children: children,
        action: action,
        val: function() {return action(children);},
        tokensUsed: function() {
            result = 0;
            for(var i = 0 ; i < children.length ; i++)
                result += children[i].tokensUsed();
            return result;
        }
    };
};

function newParseTreeTerminalNode(token) {
    return {
        id: token.id,
        children: [],
        token: token,
        action: function(nodes) {return token.content;},
        val: function() {return token.content;},
        tokensUsed: function() {return 1;}
    };
}

function getTokens(str) {
    var tokens = [];
    var match = "";
    for(var pos = 0 ; pos < str.length ; pos += match.length) {
        for(var i = 0 ; i < tokenTypes.length ; i++) {
            match = tokenTypes[i].regex.exec(str.substring(pos));
            if(match !== null) {
                match = match[0];
                tokens.push(newToken(tokenTypes[i].id, pos, match));
                break;
            }
        }
    }
    return tokens;
};

function getParseTree(tokens) {
    var parseTree = rules[0].getParseTree(tokens, 0);
    if(parseTree !== null && parseTree.tokensUsed() < tokens.length)
        return null;
    return parseTree;
};
