/*
 *  Simple Offline Calculator
 *  By Ian Esteves do Nascimento, 2015
 */

function getParseTreeDiv(parseTree) {
    if(parseTree === null)
        return "<div class='parseTreeNode'>NULL</div>";
    else {
        result = "<div class='parseTreeNode'>";
        //result += parseTree.id + "<br />" + parseTree.val() + "<br />";
        var returnedValue = parseTree.val();
        result += parseTree.id + (parseTree.id === returnedValue ? "" : " " + returnedValue) + "<br />";
        for(var i = 0 ; i < parseTree.children.length ; i++)
            result += getParseTreeDiv(parseTree.children[i]);
        return result + "</div>";
    }
}

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
    
    document.getElementById("inputString").oninput = function() {
        var inputString = document.getElementById("inputString").value;
        var tokens = getTokens(inputString);
        var parseTree = getParseTree(tokens);
        var result = parseTree.val();
        
        var content = "<tr><th>id</th><th>pos</th><th>content</th></tr>";
        for(var i = 0 ; i < tokens.length ; i++) {
            content += "<tr><td>" + tokens[i].id + "</td><td>" + tokens[i].pos + "</td><td>" + tokens[i].content + "</td></tr>";
        }
        document.getElementById("tokens").innerHTML = content;
    
        document.getElementById("parseTree").innerHTML = getParseTreeDiv(parseTree);
        
        document.getElementById("result").innerHTML = result === null ? "null" : result;
        
        errorLog = "";
        parseTree.val();
        
        document.getElementById("errorLog").textContent = errorLog;
        
    };
};