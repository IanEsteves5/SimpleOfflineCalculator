/*
 *  Simple Offline Calculator v0.6 beta
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
    new tokenType("?",     "\\?"),
    new tokenType(":",     ":"),
    new tokenType(",",     ","),
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
                                                    return memory.set(nodes[0].val(), nodes[2].val());
                                                }),
        new pattern(["EXPR2"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR2", [
        new pattern(["B_EXPR", "?", "EXPR3", ":", "EXPR3"],
                                                function(nodes) {return nodes[0].val() ? nodes[2].val() : nodes[4].val();}),
        new pattern(["EXPR3"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR3", [
        new pattern(["EXPR3", "+", "EXPR4_R+"], function(nodes) {return nodes[0].val() + nodes[2].val();}),
        new pattern(["EXPR3", "-", "EXPR4_R+"], function(nodes) {return nodes[0].val() - nodes[2].val();}),
        new pattern(["EXPR4"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR4", [
        new pattern(["EXPR4", "*", "EXPR5"],    function(nodes) {return nodes[0].val() * nodes[2].val();}),
        new pattern(["EXPR4", "/", "EXPR5"],    function(nodes) {
                                                    var val2 = nodes[2].val();
                                                    if(val2 === 0)
                                                        pushErrorLog("division by zero", nodes[1].pos);
                                                    return nodes[0].val() / val2;
                                                }),
        new pattern(["EXPR4", "%", "EXPR5"],    function(nodes) {return nodes[0].val() % nodes[2].val();}),
        new pattern(["EXPR5"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR4_R+", [
        new pattern(["EXPR4_R+", "*", "EXPR5"], function(nodes) {return nodes[0].val() * nodes[2].val();}),
        new pattern(["EXPR4_R+", "/", "EXPR5"], function(nodes) {
                                                    var val2 = nodes[2].val();
                                                    if(val2 === 0)
                                                        pushErrorLog("division by zero", nodes[1].pos);
                                                    return nodes[0].val() / val2;
                                                }),
        new pattern(["EXPR4_R+", "%", "EXPR5"], function(nodes) {return nodes[0].val() % nodes[2].val();}),
        new pattern(["EXPR5_R+"],               function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR5", [
        new pattern(["EXPR5", "^", "EXPR6"],    function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        new pattern(["EXPR6"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR5_R+", [
        new pattern(["EXPR5_R+", "^", "EXPR6"], function(nodes) {return Math.pow(nodes[0].val(), nodes[2].val());}),
        new pattern(["EXPR7"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR6", [
        new pattern(["+", "EXPR7"],             function(nodes) {return nodes[1].val();}),
        new pattern(["-", "EXPR7"],             function(nodes) {return -nodes[1].val();}),
        new pattern(["EXPR7"],                  function(nodes) {return nodes[0].val();})
    ]),
    new rule("EXPR7", [
        new pattern(["id", "(", "ARGS", ")"],   function(nodes) {
                                                    for(var i = 0 ; i < mathFunctions.length ; i++) {
                                                        if(mathFunctions[i].id === nodes[0].val()) {
                                                            if(mathFunctions[i].numArgs !== nodes[2].val().length) {
                                                                pushErrorLog(nodes[0].val() + " expected " + mathFunctions[i].numArgs + (mathFunctions[i].numArgs === 1 ? " argument" : " arguments"), nodes[0].pos);
                                                                return Number.NaN;
                                                            }
                                                            return mathFunctions[i].action(nodes[2].val(), nodes[0].token.pos);
                                                        }
                                                    }
                                                    pushErrorLog("undefined function " + nodes[0].val(), nodes[0].pos);
                                                    return Number.NaN;
                                                }),
        new pattern(["id", "(", ")"],   function(nodes) {
                                                    for(var i = 0 ; i < mathFunctions.length ; i++) {
                                                        if(mathFunctions[i].id === nodes[0].val()) {
                                                            if(mathFunctions[i].numArgs !== 0) {
                                                                pushErrorLog(nodes[0].val() + " expected " + mathFunctions[i].numArgs + (mathFunctions[i].numArgs === 1 ? " argument" : " arguments"), nodes[0].pos);
                                                                return Number.NaN;
                                                            }
                                                            return mathFunctions[i].action([], nodes[0].token.pos);
                                                        }
                                                    }
                                                    pushErrorLog("undefined function " + nodes[0].val(), nodes[0].pos);
                                                    return Number.NaN;
                                                }),
        new pattern(["(", "EXPR", ")"],         function(nodes) {return nodes[1].val();}),
        new pattern(["NUM"],                    function(nodes) {return nodes[0].val();}),
        new pattern(["id"],                     function(nodes) {
                                                    var n = memory.get(nodes[0].val());
                                                    if(n !== null)
                                                        return n;
                                                    pushErrorLog("undefined variable " + nodes[0].val(), nodes[0].pos);
                                                    return Number.NaN;
                                                })
    ]),
    new rule("ARGS", [
        new pattern(["ARGS", ",", "EXPR"],      function(nodes) {return nodes[0].val().concat(nodes[2].val());}),
        new pattern(["EXPR"],                   function(nodes) {return [nodes[0].val()];})
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
        new pattern(["EXPR", "=", "EXPR"],      function(nodes) {return nodes[0].val() === nodes[2].val();}),
        new pattern(["EXPR", "!=", "EXPR"],     function(nodes) {return nodes[0].val() !== nodes[2].val();}),
        new pattern(["EXPR", ">", "EXPR"],      function(nodes) {return nodes[0].val() > nodes[2].val();}),
        new pattern(["EXPR", "<", "EXPR"],      function(nodes) {return nodes[0].val() < nodes[2].val();}),
        new pattern(["EXPR", ">=", "EXPR"],     function(nodes) {return nodes[0].val() >= nodes[2].val();}),
        new pattern(["EXPR", "<=", "EXPR"],     function(nodes) {return nodes[0].val() <= nodes[2].val();})
    ]),
    new rule("ERROR", [                         // Error detection
        new pattern([],                         function(nodes) {
                                                    errorLog = "";
                                                    for(var i = 0 ; i < nodes.length ; i++) {
                                                        if(nodes[i].id === "err") {
                                                            pushErrorLog("unexpected input " + nodes[i].val(), nodes[i].pos);
                                                            continue;
                                                        }
                                                        if(nodes[i].id === "+" || nodes[i].id === "-") {
                                                            var str = nodes[i].id;
                                                            for(var j = i+1 ; j < nodes.length && (nodes[j].id === "+" || nodes[j].id === "-") ; j++)
                                                                str += nodes[j].id;
                                                            if(str.length > 1) {
                                                                pushErrorLog("unexpected input " + str, nodes[i].pos);
                                                                i += str.length - 1;
                                                            }
                                                            continue;
                                                        }
                                                    }
                                                    return null;
                                                })
    ])
];

var mathFunctions = [
    new mathFunction("log", 2,    function(args, pos) {
                                      if(args[0] < 0) {
                                          pushErrorLog("log of negative number", pos);
                                          return Number.NaN;
                                      }  
                                      return Math.log(args[0])/Math.log(args[1]);
                                  }),
    new mathFunction("trunc", 2,  function(args, pos) {
                                      var offset = Math.pow(10, Math.floor(args[1]));
                                      return Math.floor(args[0]*offset)/offset;
                                  }),
    new mathFunction("exp", 1,    function(args, pos) {return Math.exp(args[0]);}),
    new mathFunction("ln", 1,     function(args, pos) {
                                      if(args[0] < 0) {
                                          pushErrorLog("log of negative number", pos);
                                          return Number.NaN;
                                      }   
                                      return Math.log(args[0]);
                                  }),
    new mathFunction("log2", 1,     function(args, pos) {
                                      if(args[0] < 0) {
                                          pushErrorLog("log of negative number", pos);
                                          return Number.NaN;
                                      }   
                                      return Math.log(args[0])/Math.LN2;
                                  }),
    new mathFunction("log10", 1,     function(args, pos) {
                                      if(args[0] < 0) {
                                          pushErrorLog("log of negative number", pos);
                                          return Number.NaN;
                                      }   
                                      return Math.log(args[0])/Math.LN10;
                                  }),
    new mathFunction("sqrt", 1,   function(args, pos) {return Math.sqrt(args[0]);}),
    new mathFunction("round", 1,  function(args, pos) {return Math.round(args[0]);}),
    new mathFunction("floor", 1,  function(args, pos) {return Math.floor(args[0]);}),
    new mathFunction("abs", 1,    function(args, pos) {return Math.abs(args[0]);}),
    new mathFunction("sin", 1,    function(args, pos) {return Math.sin(args[0]);}),
    new mathFunction("cos", 1,    function(args, pos) {return Math.cos(args[0]);}),
    new mathFunction("tan", 1,    function(args, pos) {return Math.tan(args[0]);}),
    new mathFunction("asin", 1,   function(args, pos) {
                                      if(args[0] > 1 || args[0] < -1) {
                                          pushErrorLog("invalid argument for asin " + args[0], pos);
                                          return Number.NaN;
                                      }
                                      return Math.asin(args[0]);
                                  }),
    new mathFunction("acos", 1,   function(args, pos) {
                                      if(args[0] > 1 || args[0] < -1) {
                                          pushErrorLog("invalid argument for acos " + args[0], pos);
                                          return Number.NaN;
                                      }
                                      return Math.acos(args[0]);
                                  }),
    new mathFunction("atan", 1,   function(args, pos) {return Math.atan(args[0]);}),
    new mathFunction("fact", 1,   function(args, pos) {
                                      if(args[0] < 1)
                                          return 0;
                                      var result = 1;
                                      for(var i = Math.floor(args[0]) ; i > 1 ; i--) {
                                          if(result === Number.POSITIVE_INFINITY)
                                              break;
                                          result *= i;
                                      }
                                      return result;
                                  }),
    new mathFunction("random", 0, function(args, pos) {return Math.random();}),
    new mathFunction("pi", 0,     function(args, pos) {return Math.PI;}),
    new mathFunction("e", 0,      function(args, pos) {return Math.E;})
];

var memory = [];

memory.set = function(id, val) {
    for(var i = 0 ; i < this.length ; i++)
        if(this[i].id === id)
            return this[i].val = val;
    this.push(new memoryEntry(id, val));
    return val;
};

memory.get = function(id) {
    for(var i = 0 ; i < this.length ; i++)
        if(this[i].id === id)
            return this[i].val;
    return null;
};

memory.empty = function() {
    this.length = 0;
};

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

function isTokenType(id) {
    for(var i = 0 ; i < tokenTypes.length ; i++)
        if(tokenTypes[i].id === id)
            return true;
    return false;
}

function getParseTree(tokens) {
    // ***** OPTIMIZATIONS *****
    var cleanTokens = []; // Removing white spaces
    for(var i = 0 ; i < tokens.length ; i++)
        if(tokens[i].id !== "ws")
            cleanTokens.push(tokens[i]);
    // *************************
    return rules[0].getParseTree(cleanTokens, 0, true);
};

function calculate(str) {
    errorLog = "";
    return getParseTree(getTokens(str)).val();
};

function pushErrorLog(str, pos) {
    errorLog += (errorLog === "" ? "" : "\n") + "[" + (pos + 1) + "] " + str;
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
    this.getParseTree = function(tokens, tokensUsed, isLast) { // isLast records weather the rule is in the beginning of the expression
        for(var i = 0 ; i < this.patterns.length ; i++) {
            var parseTree = this.patterns[i].getParseTree(tokens, tokensUsed, isLast);
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
        // ***** OPTIMIZATIONS *****
        for(var i = 0 ; i < this.elements.length ; i++) { // Checking if all terminal symbols are present in the tokens
            if(isTokenType(this.elements[i])) {
                var tokenFound = false;
                var nextStart = 0;
                for(var j = nextStart ; j < tokens.length - tokensUsed ; j++) {
                    if(this.elements[i] === tokens[j].id) {
                        tokenFound = true;
                        nextStart = j + 1;
                        break;
                    }
                }
                if(!tokenFound)
                    return null;
            }
        }
        // *************************
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

function mathFunction(id, numArgs, func) {
    this.id = id;
    this.numArgs = numArgs;
    this.action = function(args, pos) {return func(args, pos);};
};

function memoryEntry(id, val) {
    this.id = id;
    this.val = val;
};
