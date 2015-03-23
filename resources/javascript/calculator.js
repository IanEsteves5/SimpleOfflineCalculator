// Global variables

var tokenTypes = [ // Terminal symbols
    new tokenType("ws",    "\\s+"),
    //new tokenType("id",    "[a-zA-Z_]\\w*"),
    new tokenType("real",  "\\d*\\.\\d+"),
    new tokenType("int",   "\\d+"),
    new tokenType("(",     "\\("),
    new tokenType(")",     "\\)"),
    new tokenType("+",     "\\+"),
    new tokenType("-",     "-"),
    new tokenType("*",     "\\*"),
    new tokenType("/",     "/"),
    new tokenType("%",     "%"),
    new tokenType("^",     "\\^"),
    //new tokenType("=",     "="),
    //new tokenType(">",     ">"),
    //new tokenType("<",     "<"),
    //new tokenType(",",     ","),
    //new tokenType(":",     ":"),
    //new tokenType("\\?",     "?"),
    new tokenType("error", ".*")
];

var rules = [ // Non terminal symbols. Patterns are evaluated right to left
    new rule("EXPR", [
        new pattern(["EXPR", "+", "EXPR2_R+"],  function(nodes) {return nodes[0].val() + nodes[2].val();}),
        new pattern(["EXPR", "-", "EXPR2_R+"],  function(nodes) {return nodes[0].val() - nodes[2].val();}),
        new pattern(["EXPR", "ws"],             function(nodes) {return nodes[0].val();}),
        new pattern(["ws", "EXPR2"],            function(nodes) {return nodes[1].val();}),
        new pattern(["EXPR2"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR2", [
        new pattern(["EXPR2", "*", "EXPR3"],    function(nodes) {return nodes[0].val() * nodes[2].val();}),
        new pattern(["EXPR2", "/", "EXPR3"],    function(nodes) {return nodes[0].val() / nodes[2].val();}),
        new pattern(["EXPR2", "%", "EXPR3"],    function(nodes) {return nodes[0].val() % nodes[2].val();}),
        new pattern(["EXPR3"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR2_R+", [
        new pattern(["EXPR2_R+", "*", "EXPR3"], function(nodes) {return nodes[0].val() * nodes[2].val();}),
        new pattern(["EXPR2_R+", "/", "EXPR3"], function(nodes) {return nodes[0].val() / nodes[2].val();}),
        new pattern(["EXPR2_R+", "%", "EXPR3"], function(nodes) {return nodes[0].val() % nodes[2].val();}),
        new pattern(["EXPR3_R+"],               function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR3", [
        new pattern(["EXPR3", "^", "EXPR4"],    function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        new pattern(["EXPR4"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR3_R+", [
        new pattern(["EXPR3_R+", "^", "EXPR4"], function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        new pattern(["EXPR5"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR4", [
        new pattern(["+", "EXPR5"],             function(nodes) {return nodes[1].val();}),
        new pattern(["-", "EXPR5"],             function(nodes) {return -nodes[1].val();}),
        new pattern(["EXPR5"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR5", [
        new pattern(["(", "EXPR", ")"],         function(nodes) {return nodes[1].val();}),
        new pattern(["NUM"],                    function(nodes) {return nodes[0].val();})
    ]),
    new rule("NUM", [
        new pattern(["int"],                    function(nodes) {return parseInt(nodes[0].val());}),
        new pattern(["real"],                   function(nodes) {return parseFloat(nodes[0].val());})
    ])
];

// Functions

function getTokens(str) {
    var tokens = [];
    var match = "";
    for(var pos = 0 ; pos < str.length ; pos += match.length) {
        for(var i = 0 ; i < tokenTypes.length ; i++) {
            match = tokenTypes[i].regex.exec(str.substring(pos));
            if(match !== null) {
                match = match[0];
                tokens.push(new token(tokenTypes[i].id, pos, match));
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

// Types

function tokenType(id, regexStr) {
    this.id = id;
    this.regexStr = regexStr;
    this.regex = new RegExp("^" + regexStr);
};

function token(id, pos, content) {
    this.id = id;
    this.pos = pos;
    this.content = content;
};

function rule(id, patterns) {
    this.id = id;
    this.patterns = patterns;
    this.getParseTree = function(tokens, tokensUsed) {
        for(var i = 0 ; i < patterns.length ; i++) {
            var parseTree = patterns[i].getParseTree(tokens, tokensUsed);
            if(parseTree !== null) {
                parseTree.id = id;
                return parseTree;
            }
        }
        return null;
    };
};

function pattern(elements, action) {
    this.elements = elements;
    this.getPatternString = function() {
        return "[" + elements.join(" ") + "]";
    };
    this.getParseTree = function(tokens, tokensUsed) {
        var children = [];
        var remainingTokens = tokens.length - tokensUsed;
        var remainingElements = elements.length;
        
        while(remainingTokens > 0 && remainingElements > 0) { // Evaluates each element right to left
            remainingElements--;
            var node = null;
            
            if(elements[remainingElements] === tokens[remainingTokens-1].id) // Checks if current element is terminal
                node = new parseTreeTerminalNode(tokens[remainingTokens-1]);
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
        return new parseTreeNode(children, action);
    };
}

function parseTreeNode(children, action) {
    this.id = "";
    this.children = children;
    this.val = function() {return action(children);};
    this.tokensUsed = function() {
        result = 0;
        for(var i = 0 ; i < children.length ; i++)
            result += children[i].tokensUsed();
        return result;
    };
};

function parseTreeTerminalNode(token) {
    this.id = token.id;
    this.children = [];
    this.val = function() {return token.content;};
    this.tokensUsed = function() {return 1;};
}
