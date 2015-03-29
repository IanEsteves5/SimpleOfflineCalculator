/*
 *  Simple Offline Calculator v0.3 beta
 *  By Ian Esteves do Nascimento, 2015
 */

var plot = {
    plotCanvas : document.getElementById("plot"),
    plotContext : document.getElementById("plot").getContext("2d"),
    height : 500,
    width : 500,
    xmin : -10.0,
    xmax : 10.0,
    ymin : -10.0,
    ymax : 10.0,
    xstep : 0.1,
    numberOfFunctions : 1,
    init : function() {
        this.width = window.innerWidth;
        this.plotCanvas.width = this.width;
        this.height = window.innerHeight;
        this.plotCanvas.height = this.height;
        this.ymin = -10.0;
        this.ymax = 10.0;
        this.xmin = this.ymin*(this.width/this.height);
        this.xmax = this.ymax*(this.width/this.height);
        this.xstep = (this.xmax-this.xmin)/1000;
        this.drawAxes();
    },
    zoomIn : function(step) {
        var centerx = (this.xmax + this.xmin)/2;
        var centery = (this.ymax + this.ymin)/2;
        this.xmin = (this.xmin-centerx)/step+centerx;
        this.xmax = (this.xmax-centerx)/step+centerx;
        this.ymin = (this.ymin-centery)/step+centery;
        this.ymax = (this.ymax-centery)/step+centery;
        this.xstep = (this.xmax-this.xmin)/1000;
        this.drawEverything();
    },
    zoomOut : function(step) {
        var centerx = (this.xmax + this.xmin)/2;
        var centery = (this.ymax + this.ymin)/2;
        this.xmin = (this.xmin-centerx)*step+centerx;
        this.xmax = (this.xmax-centerx)*step+centerx;
        this.ymin = (this.ymin-centery)*step+centery;
        this.ymax = (this.ymax-centery)*step+centery;
        this.xstep = (this.xmax-this.xmin)/1000;
        this.drawEverything();
    },
    drag : function(x, y) {
        this.xmin -= x*(this.xmax-this.xmin)/this.width;
        this.xmax -= x*(this.xmax-this.xmin)/this.width;
        this.ymin += y*(this.ymax-this.ymin)/this.height;
        this.ymax += y*(this.ymax-this.ymin)/this.height;
        this.drawEverything();
    },
    clear : function() {
        this.plotCanvas.height = this.plotCanvas.height; // This is not a mistake.
    },
    getXPixel : function(x) { // Converts math coordinates into pixel coordinates.
        return this.width*(x-this.xmin)/(this.xmax-this.xmin);
    },
    getYPixel : function(y) {
        return this.height*(y-this.ymax)/(this.ymin-this.ymax);
    },
    moveToCoord : function(x, y) { // Starts a line.
        this.plotContext.moveTo(this.getXPixel(x),this.getYPixel(y));
    },
    lineToCoord : function(x, y) { // Ends a line.
        this.plotContext.lineTo(this.getXPixel(x),this.getYPixel(y));
    },
    drawAxes : function () {
        this.plotContext.beginPath();
        this.plotContext.strokeStyle = "#AAAAAA";
        this.moveToCoord(0, this.ymin);
        this.lineToCoord(0, this.ymax);
        this.moveToCoord(this.xmin, 0);
        this.lineToCoord(this.xmax, 0);
        for(var x = Math.ceil(this.xmin) ; x <= this.xmax ; x++) {
            if(x === 0)
                continue;
            this.plotContext.moveTo(this.getXPixel(x),this.getYPixel(0)-5);
            this.plotContext.lineTo(this.getXPixel(x),this.getYPixel(0)+5);
        }
        for(var y = Math.ceil(this.xmin) ; y <= this.xmax ; y++) {
            if(y === 0)
                continue;
            this.plotContext.moveTo(this.getXPixel(0)-5,this.getYPixel(y));
            this.plotContext.lineTo(this.getXPixel(0)+5,this.getYPixel(y));
        }
        this.plotContext.stroke();
    },
    drawFunctions : function() {
        var functionParseTrees = [];
        for(var i = 0 ; i < this.numberOfFunctions ; i++) {
            var newParseTree = getParseTree(getTokens(document.getElementById("plotFunction" + i).value));
            if(newParseTree === null)
                continue;
            functionParseTrees.push(newParseTree);
        }
        
        var x = new memoryEntry("x", this.xmin);
        memory = [];
        memory.push(x);
        var y = [];
        for(var i = 0 ; i < functionParseTrees.length ; i++)
            y.push(functionParseTrees[i].val());
        
        this.plotContext.beginPath();
        this.plotContext.strokeStyle = "#000000";
        while(x.val < this.xmax) {
            var xPrev = x.val;
            x.val += this.xstep;
            for(var i = 0 ; i < functionParseTrees.length ; i++) {
                errorLog = ""; // error log will not be used. probably.
                if(y[i] === null || y === true || y===false || isNaN(y[i])) {
                    y[i] = functionParseTrees[i].val();
                    continue;
                }
                this.moveToCoord(xPrev, y[i]);
                y[i] = functionParseTrees[i].val();
                this.lineToCoord(x.val, y[i]);
            }
        }
        this.plotContext.stroke();
    },
    drawEverything : function() {
        this.clear();
        this.drawAxes();
        this.drawFunctions();
    }
};

var mouseDownFlag = false;
var lastMousePos = {x:0,y:0};

window.onload = function() {
    
    plot.init();
    
    document.getElementById("plotControls").onkeyup = function(event) {
        if(event.keyCode !== 13) // enter
            return;
        plot.drawEverything();
    };
    
    document.getElementById("plot").onmousewheel = function(event) {
        if(event.deltaY > 0)
            plot.zoomOut(1.2);
        if(event.deltaY < 0)
            plot.zoomIn(1.2);
    };
    
    document.getElementById("plot").onmousedown = function(event) {
        mouseDownFlag = true;
        lastMousePos = {
            x : event.clientX,
            y : event.clientY
        };
    };
    
    document.getElementById("plot").onmouseup = function(event) {
        mouseDownFlag = false;
    };
    
    document.getElementById("plot").onmousemove = function(event) {
        if(!mouseDownFlag)
            return;
        plot.drag(event.clientX-lastMousePos.x, event.clientY-lastMousePos.y);
        lastMousePos = {
            x : event.clientX,
            y : event.clientY
        };
    };
    
    document.getElementById("addFunction").onmousedown = function(event) {
        if(plot.numberOfFunctions >= 5)
            return;
        var newInput = document.createElement("input");
        document.getElementById("plotFunctions").appendChild(document.createElement("br"));
        document.getElementById("plotFunctions").appendChild(newInput);
        newInput.id = "plotFunction" + plot.numberOfFunctions;
        newInput.classList.add("plotFunctionInput");
        plot.numberOfFunctions++;
    };
    
    document.getElementById("removeFunction").onmousedown = function(event) {
        if(plot.numberOfFunctions <= 1)
            return;
        document.getElementById("plotFunctions").removeChild(document.getElementById("plotFunctions").lastChild); // Input
        document.getElementById("plotFunctions").removeChild(document.getElementById("plotFunctions").lastChild); // Line break
        plot.numberOfFunctions--;
        plot.drawEverything();
    };
};
