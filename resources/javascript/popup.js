/*
 *  Simple Offline Calculator v0.2 beta
 *  By Ian Esteves do Nascimento, 2015
 */

var commands = [
    new command("help", function() {
        var result = "Commands :";
        for(var i = 0 ; i < commands.length ; i++)
            result += "\n" + commands[i].name;
        return result;
    }),
    new command("clear", function() {
        document.getElementById("calculatorInput").value = "";
        document.getElementById("calculatorOutput").textContent = "";
        return "";
    }),
    new command("memory", function() {
        if(memory.length === 0)
            return "Empty"
        var result = memory[0].id + " = " + memory[0].val;
        for(var i = 1 ; i < memory.length ; i++)
            result += "\n" + memory[i].id + " = " + memory[i].val;
        return result;
    }),
    new command("log", function() {
        return errorLog;
    }),
    new command("tree", function() {
        window.open("tree.html", "Tree");
        return "Opening tree...";
    })
];

var secretCommands = [
    new command(String.fromCharCode(0x50)+String.fromCharCode(0x45)+String.fromCharCode(0x4E)+String.fromCharCode(0x49)+String.fromCharCode(0x53), function() {
        return String.fromCharCode(0x38)+String.fromCharCode(0x3D)+String.fromCharCode(0x3D)+String.fromCharCode(0x3D)+String.fromCharCode(0x3D)+String.fromCharCode(0x3D)+String.fromCharCode(0x44)+String.fromCharCode(0x7E)+String.fromCharCode(0x7E)+String.fromCharCode(0x7E);
    })
];

function command(name, action) {
    this.name = name;
    this.action = action; // Action returns a message to the user.
};

window.onload = function() {
    
    var calculatorInput = document.getElementById("calculatorInput");
    
    var calculatorOutput = document.getElementById("calculatorOutput");
    
    // Registering events
    
    calculatorInput.onkeyup = function(event) {
        if(event.keyCode !== 13)
            return;
            
        var newOutput = null;
        
        for(var i = 0 ; i < commands.length ; i++) {
            if(commands[i].name === calculatorInput.value) {
                newOutput = commands[i].action();
                break;
            }
        }
        
        for(var i = 0 ; i < secretCommands.length ; i++) {
            if(secretCommands[i].name === calculatorInput.value) {
                newOutput = secretCommands[i].action();
                break;
            }
        }
        
        if(newOutput === null) {
            if(calculatorInput.value === "")
                calculatorInput.value = "0";
            result = calculate(calculatorInput.value);
            if(result === null) {
                newOutput = "ERR = " + calculatorInput.value;
            }
            else {
                newOutput =  result + " = " + calculatorInput.value;
                calculatorInput.value = result;
            }
        }
        
        calculatorOutput.textContent = newOutput + (calculatorOutput.textContent === "" ? "" : "\n") + calculatorOutput.textContent;
    };
    
};
