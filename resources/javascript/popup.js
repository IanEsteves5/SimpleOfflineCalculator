var commands = [
    new command("help", function() {
        var result = "Commands :";
        for(var i = 0 ; i < commands.length ; i++)
            result += "\n" + commands[i].name;
        return result;
    }),
    new command("clear", function() {
        calculatorOutput.textContent = "";
        return "";
    }),
    new command("tree", function() {
        window.open("tree.html", "Tree");
        return "Opening tree...";
    })
];

function command(name, action) {
    this.name = name;
    this.action = action; // Action returns a message to the user.
}

window.onload = function() {
    
    var calculatorInput = document.getElementById("calculatorInput");
    
    var calculatorOutput = document.getElementById("calculatorOutput");
    
    // Registering events
    
    calculatorInput.onkeyup = function(event) {
        if(event.keyCode !== 13)
            return;
            
        var newOutput = null;
        
        for(var i = 0 ; i < commands.length ; i++) {
            if(commands[i].name === calculatorInput.value)
                newOutput = commands[i].action();
        }
        
        if(newOutput === null) {
            if(calculatorInput.value === "")
                calculatorInput.value = "0";
            parseTree = getParseTree(getTokens(calculatorInput.value));
            if(parseTree === null)
                newOutput = "ERR";
            else
                newOutput = parseTree.val() + " = " + calculatorInput.value;
        }
        
        calculatorOutput.textContent = newOutput + (calculatorOutput.textContent === "" ? "" : "\n") + calculatorOutput.textContent;
    };
    
};
