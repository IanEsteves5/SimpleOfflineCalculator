/*
 *  Simple Offline Calculator v0.6
 *  By Ian Esteves do Nascimento, 2015
 */

function getParseTreeDiv(parseTree) {
    if(parseTree === null)
        return "<div class='parseTreeNode'>NULL</div>";
    else {
        result = "<div class='parseTreeNode'>";
        var returnedValue = parseTree.val();
        if(returnedValue !== null && returnedValue.constructor === Array)
            returnedValue = "[" + returnedValue.join() + "]";
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
        content += "</td></tr>";
    }
    document.getElementById("rules").innerHTML = content;
    
    // Registering events
    
    document.getElementById("inputString").onkeyup = function() {
        
        var inputString = document.getElementById("inputString").value;
        var content = "";
        var t0, t1, t2, t3;
        errorLog = "";
        memory.empty();
        
        t0 = window.performance.now();
        var tokens = getTokens(inputString);
        t1 = window.performance.now();
        var parseTree = getParseTree(tokens);
        t2 = window.performance.now();
        var result = null;
        if(parseTree !== null)
            result = parseTree.val();
        t3 = window.performance.now();
        
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
        
        var elapsedTime;
        content = "generating tokens : ";
        elapsedTime = Math.floor((t1 - t0)*1000)/1000;
        content += elapsedTime === 0 ? "<1us\n" : elapsedTime + "ms\n";
        content += "generating parse tree : ";
        elapsedTime = Math.floor((t2 - t1)*1000)/1000;
        content += elapsedTime === 0 ? "<1us\n" : elapsedTime + "ms\n";
        content += "calculating result : ";
        elapsedTime = Math.floor((t3 - t2)*1000)/1000;
        content += elapsedTime === 0 ? "<1us\n" : elapsedTime + "ms\n";
        document.getElementById("timings").textContent = content;
    
        document.getElementById("parseTree").innerHTML = getParseTreeDiv(parseTree);
        
    };
};