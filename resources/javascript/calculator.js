/*
 *  Simple Offline Calculator v0.2 beta
 *  By Ian Esteves do Nascimento, 2015
 *  
 *  Implementation of the parsing algorithms for a calculator.
 *  
 *  Usage:
 *  
 *  calculate(str)
 *  
 *  Returns the result or null in case of an error.
 *  If there are error messages, they will appear in the errorLog variable.
 *  The calculator memory is stored in the memory variable
 */

// Global variables

var tokenTypes = [ // Terminal symbols
    new tokenType("ws",    "\\s+"),
    new tokenType("id",    "[a-zA-Z_]\\w*"),
    new tokenType("real",  "\\d*\\.\\d+"),
    new tokenType("int",   "\\d+"),
    new tokenType(":=",    ":="),
    new tokenType(">=",    ">="),
    new tokenType("<=",    "<="),
    new tokenType("!=",    "!="),
    new tokenType("(",     "\\("),
    new tokenType(")",     "\\)"),
    new tokenType("+",     "\\+"),
    new tokenType("-",     "-"),
    new tokenType("*",     "\\*"),
    new tokenType("/",     "/"),
    new tokenType("%",     "%"),
    new tokenType("^",     "\\^"),
    new tokenType(">",     ">"),
    new tokenType("<",     "<"),
    new tokenType("=",     "="),
    new tokenType("!",     "!"),
    new tokenType("&",     "&"),
    new tokenType("|",     "\\|"),
    //new tokenType(",",     ","),
    //new tokenType("\\?",     "?"),
    //new tokenType(":",     ":"),
    new tokenType("err", ".*")
];

var rules = [ // Non terminal symbols. Patterns are evaluated right to left
    new rule("INPUT", [
        new pattern(["EXPR"],                   function(nodes) {return nodes[0].val();}),
        new pattern(["B_EXPR"],                 function(nodes) {return nodes[0].val();}),
        new pattern(["ERROR"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR", [                          // Numeric expressions
        new pattern(["id", ":=", "EXPR2"],      function(nodes) {
                                                    for(var i = 0 ; i < memory.length ; i++)
                                                        if(memory[i].id === nodes[0].val())
                                                            return memory[i].val = nodes[2].val();
                                                    memory.push(new memoryEntry(nodes[0].val(), nodes[2].val()));
                                                    return memory[memory.length-1].val;
                                                }),
        new pattern(["EXPR2"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR2", [
        new pattern(["EXPR2", "+", "EXPR3_R+"], function(nodes) {return nodes[0].val() + nodes[2].val();}),
        new pattern(["EXPR2", "-", "EXPR3_R+"], function(nodes) {return nodes[0].val() - nodes[2].val();}),
        new pattern(["EXPR3"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR3", [
        new pattern(["EXPR3", "*", "EXPR4"],    function(nodes) {return nodes[0].val() * nodes[2].val();}),
        new pattern(["EXPR3", "/", "EXPR4"],    function(nodes) {return nodes[0].val() / nodes[2].val();}),
        new pattern(["EXPR3", "%", "EXPR4"],    function(nodes) {return nodes[0].val() % nodes[2].val();}),
        new pattern(["EXPR4"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR3_R+", [
        new pattern(["EXPR3_R+", "*", "EXPR4"], function(nodes) {return nodes[0].val() * nodes[2].val();}),
        new pattern(["EXPR3_R+", "/", "EXPR4"], function(nodes) {return nodes[0].val() / nodes[2].val();}),
        new pattern(["EXPR3_R+", "%", "EXPR4"], function(nodes) {return nodes[0].val() % nodes[2].val();}),
        new pattern(["EXPR4_R+"],               function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR4", [
        new pattern(["EXPR4", "^", "EXPR5"],    function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        new pattern(["EXPR5"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR4_R+", [
        new pattern(["EXPR4_R+", "^", "EXPR5"], function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        new pattern(["EXPR6"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR5", [
        new pattern(["+", "EXPR6"],             function(nodes) {return nodes[1].val();}),
        new pattern(["-", "EXPR6"],             function(nodes) {return -nodes[1].val();}),
        new pattern(["EXPR6"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR6", [
        new pattern(["(", "EXPR", ")"],         function(nodes) {return nodes[1].val();}),
        new pattern(["NUM"],                    function(nodes) {return nodes[0].val();}),
        new pattern(["id"],                     function(nodes) {
                                                    for(var i = 0 ; i < memory.length ; i++) {
                                                        if(memory[i].id === nodes[0].val()) {
                                                            return memory[i].val;
                                                        }
                                                    }
                                                    pushErrorLog("[" + (nodes[0].token.pos + 1) + "] undefined variable " + nodes[i].val());
                                                    return Number.NaN;
                                                })
    ]),
    new rule("NUM", [
        new pattern(["int"],                    function(nodes) {return parseInt(nodes[0].val());}),
        new pattern(["real"],                   function(nodes) {return parseFloat(nodes[0].val());})
    ]),
    new rule("B_EXPR", [                        // Boolean expressions
        new pattern(["B_EXPR", "|", "B_EXPR2"], function(nodes) {return nodes[0].val() || nodes[2].val();}),
        new pattern(["B_EXPR2"],                function(nodes) {return nodes[0].val();})
    ]),
    new rule("B_EXPR2", [
        new pattern(["B_EXPR2", "&", "B_EXPR3"],function(nodes) {return nodes[0].val() && nodes[2].val();}),
        new pattern(["B_EXPR3"],                function(nodes) {return nodes[0].val();})
    ]),
    new rule("B_EXPR3", [
        new pattern(["!", "B_EXPR4"],           function(nodes) {return !nodes[1].val();}),
        new pattern(["B_EXPR4"],                function(nodes) {return nodes[0].val();})
    ]),
    new rule("B_EXPR4", [
        new pattern(["(", "B_EXPR", ")"],       function(nodes) {return nodes[1].val();}),
        new pattern(["COMP"],                   function(nodes) {return nodes[0].val();})
    ]),
    new rule("COMP", [
        new pattern(["EXPR2", "=", "EXPR2"],    function(nodes) {return nodes[0].val() === nodes[2].val();}),
        new pattern(["EXPR2", "!=", "EXPR2"],   function(nodes) {return nodes[0].val() !== nodes[2].val();}),
        new pattern(["EXPR2", ">", "EXPR2"],    function(nodes) {return nodes[0].val() > nodes[2].val();}),
        new pattern(["EXPR2", "<", "EXPR2"],    function(nodes) {return nodes[0].val() < nodes[2].val();}),
        new pattern(["EXPR2", ">=", "EXPR2"],   function(nodes) {return nodes[0].val() >= nodes[2].val();}),
        new pattern(["EXPR2", "<=", "EXPR2"],   function(nodes) {return nodes[0].val() <= nodes[2].val();})
    ]),
    new rule("ERROR", [                         // Error detection
        new pattern([],                         function(nodes) {
                                                    errorLog = "";
                                                    for(var i = 0 ; i < nodes.length ; i++) {
                                                        if(nodes[i].id === "err") {
                                                            pushErrorLog("[" + (nodes[i].token.pos + 1) + "] unexpected input " + nodes[i].val());
                                                            continue;
                                                        }
                                                        if(nodes[i].id === "+" || nodes[i].id === "-") {
                                                            var str = nodes[i].id;
                                                            for(var j = i+1 ; j < nodes.length && (nodes[j].id === "+" || nodes[j].id === "-") ; j++)
                                                                str += nodes[j].id;
                                                            if(str.length > 1) {
                                                                pushErrorLog("[" + (nodes[i].token.pos + 1) + "] unexpected input " + str);
                                                                i += str.length - 1;
                                                            }
                                                            continue;
                                                        }
                                                    }
                                                    return null;
                                                })
    ])
];

var memory = [];

var errorLog = "";

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
    var cleanTokens = [];
    for(var i = 0 ; i < tokens.length ; i++)
        if(tokens[i].id !== "ws")
            cleanTokens.push(tokens[i]);
    return rules[0].getParseTree(cleanTokens, 0, true);
};

function calculate(str) {
    errorLog = "";
    return getParseTree(getTokens(str)).val();
};

function pushErrorLog(str) {
    errorLog += (errorLog === "" ? "" : "\n") + str;
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
    this.getParseTree = function(tokens, tokensUsed, isLast) { // isLast records weather the rule is
        for(var i = 0 ; i < patterns.length ; i++) {           // in the beginning of the expression
            var parseTree = patterns[i].getParseTree(tokens, tokensUsed, isLast);
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
        return "[" + this.elements.join(" ") + "]";
    };
    this.getParseTree = function(tokens, tokensUsed, isLast) {
        var children = [];
        var remainingTokens = tokens.length - tokensUsed;
        var remainingElements = this.elements.length;
        
        if(remainingElements === 0) { // Empty pattern accepts everything
            for(var i = 0 ; i < remainingTokens ; i++)
                children.push(new parseTreeTerminalNode(tokens[i]));
            return new parseTreeNode(children, action);
        }
        
        while(remainingTokens > 0 && remainingElements > 0) { // Evaluates each element right to left
            remainingElements--;
            var node = null;
            
            if(this.elements[remainingElements] === tokens[remainingTokens-1].id) // Checks if current element is terminal
                node = new parseTreeTerminalNode(tokens[remainingTokens-1]);
            else for(var i = 0 ; i < rules.length ; i++) { // Checks if current element is non terminal
                if(this.elements[remainingElements] === rules[i].id) {
                    node = rules[i].getParseTree(tokens, tokens.length - remainingTokens, isLast && remainingElements === 0);
                    break;
                }
            }
            
            if(node === null) { // Element not found
                return null;
            }
            children.unshift(node); // Element found
            remainingTokens -= node.tokensUsed();
        }
        
        if(isLast && remainingTokens === 0) { // Checks if pattern can be reduced to nothing
            while(remainingElements > 0) {
                remainingElements--;
                var node = null;
                for(var i = 0 ; i < rules.length ; i++) {
                    if(this.elements[remainingElements] === rules[i].id) {
                        node = rules[i].getParseTree(tokens, tokens.length - remainingTokens, isLast && remainingElements === 0);
                        break;
                    }
                }
                if(node === null)
                    return null;
                children.unshift(node);
            }
        }
        
        if(remainingElements > 0)
            return null;
        if(isLast && remainingTokens > 0)
            return null;
        return new parseTreeNode(children, action);
    };
};

function parseTreeNode(children, action) {
    this.id = "";
    this.children = children;
    this.val = function() {return action(children);};
    this.pos = this.children[0].pos;
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
    this.token = token;
    this.val = function() {return this.token.content;};
    this.pos = token.pos;
    this.tokensUsed = function() {return 1;};
};

function memoryEntry(id, val) {
    this.id = id;
    this.val = val;
};
