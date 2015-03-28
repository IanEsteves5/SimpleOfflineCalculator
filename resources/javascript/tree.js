/*
 *  Simple Offline Calculator v0.2 beta
 *  By Ian Esteves do Nascimento, 2015
 */

function getParseTreeDiv(parseTree) {
    if(parseTree === null)
        return "<div class='parseTreeNode'>NULL</div>";
    else {
        result = "<div class='parseTreeNode'>";
        var returnedValue = parseTree.val();
        result += parseTree.id + (parseTree.id === returnedValue ? "" : " " + returnedValue) + "<br />";
        for(var i = 0 ; i < parseTree.children.length ; i++)
            result += getParseTreeDiv(parseTree.children[i]);
        return result + "</div>";
    }
};

window.onload = function() {
    var content = "<tr><th>id</th><th>regex</th></tr>";
    for(var i = 0 ; i < tokenTypes.length ; i++) {
        content += "<tr><td>" + tokenTypes[i].id + "</td><td>" + tokenTypes[i].regexStr + "</td></tr>";
    }
    document.getElementById("tokenTypes").innerHTML = content;
    
    content = "<tr><th>id</th><th>pattern</th></tr>";
    for(var i = 0 ; i < rules.length ; i++) {
        content += "<tr><td>" + rules[i].id + "</td><td>";
        for(var j = 0 ; j < rules[i].patterns.length ; j++)
            content +=  rules[i].patterns[j].getPatternString() + "<br />";
        content += "</td></tr>"
    }
    document.getElementById("rules").innerHTML = content;
    
    // Registering events
    
    document.getElementById("inputString").onkeyup = function() {
        
        var inputString = document.getElementById("inputString").value;
        var content = "";
        var t0, t1, t2, t3;
        errorLog = "";
        memory = [];
        
        t0 = new Date();
        var tokens = getTokens(inputString);
        t1 = new Date();
        var parseTree = getParseTree(tokens);
        t2 = new Date();
        var result = parseTree.val();
        t3 = new Date();
        
        content = "<tr><th>id</th><th>pos</th><th>content</th></tr>";
        for(var i = 0 ; i < tokens.length ; i++) {
            content += "<tr><td>" + tokens[i].id + "</td><td>" + tokens[i].pos + "</td><td>" + tokens[i].content + "</td></tr>";
        }
        document.getElementById("tokens").innerHTML = content;
        
        document.getElementById("result").innerHTML = result === null ? "null" : result;
        
        var content = "";
        for(var i = 0 ; i < memory.length ; i++)
            content += (i === 0 ? "" : "\n") + memory[i].id + " = " + memory[i].val;
        document.getElementById("memory").textContent = content;
        
        document.getElementById("errorLog").textContent = errorLog;
        
        content = "generating tokens : " + (t1.getTime() - t0.getTime() < 1 ? "< 1" : t1.getTime() - t0.getTime()) + "ms\n";
        content += "generating parse tree : " + (t2.getTime() - t1.getTime() < 1 ? "< 1" : t2.getTime() - t1.getTime()) + "ms\n";
        content += "calculating result : " + (t3.getTime() - t2.getTime() < 1 ? "< 1" : t3.getTime() - t2.getTime()) + "ms\n";
        document.getElementById("timings").textContent = content;
    
        document.getElementById("parseTree").innerHTML = getParseTreeDiv(parseTree);
        
    };
};