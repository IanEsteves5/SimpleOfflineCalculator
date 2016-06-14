/*
 *  Simple Offline Calculator v0.6
 *  By Ian Esteves do Nascimento, 2015-2016
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
    functionParseTrees : [],
    init : function() {
        this.width = window.innerWidth;
        this.plotCanvas.width = this.width;
        this.height = window.innerHeight;
        this.plotCanvas.height = this.height;
        this.ymin = -10.0;
        this.ymax = 10.0;
        this.xmin = this.ymin*(this.width/this.height);
        this.xmax = this.ymax*(this.width/this.height);
        this.xstep = (this.xmax-this.xmin)*1.1/this.width;
        this.getParseTrees();
        this.drawAxes();
    },
    getParseTrees : function() {
        this.functionParseTrees = [];
        for(var i = 0 ; i < this.numberOfFunctions ; i++) {
            var newParseTree = getParseTree(getTokens(document.getElementById("plotFunction" + i).value));
            if(newParseTree === null)
                continue;
            this.functionParseTrees.push(newParseTree);
        }
    },
    zoomIn : function(step) {
        var centerx = (this.xmax + this.xmin)/2;
        var centery = (this.ymax + this.ymin)/2;
        this.xmin = (this.xmin-centerx)/step+centerx;
        this.xmax = (this.xmax-centerx)/step+centerx;
        this.ymin = (this.ymin-centery)/step+centery;
        this.ymax = (this.ymax-centery)/step+centery;
        this.xstep = (this.xmax-this.xmin)*1.1/this.width;
        this.drawEverything();
    },
    zoomOut : function(step) {
        var centerx = (this.xmax + this.xmin)/2;
        var centery = (this.ymax + this.ymin)/2;
        this.xmin = (this.xmin-centerx)*step+centerx;
        this.xmax = (this.xmax-centerx)*step+centerx;
        this.ymin = (this.ymin-centery)*step+centery;
        this.ymax = (this.ymax-centery)*step+centery;
        this.xstep = (this.xmax-this.xmin)*1.1/this.width;
        this.drawEverything();
    },
    drag : function(x, y) {
        this.xmin -= x*(this.xmax-this.xmin)/this.width;
        this.xmax -= x*(this.xmax-this.xmin)/this.width;
        this.ymin += y*(this.ymax-this.ymin)/this.height;
        this.ymax += y*(this.ymax-this.ymin)/this.height;
        this.drawEverything();
    },
    resize : function(width, height) {
        var centerx = (this.xmax + this.xmin)/2;
        var centery = (this.ymax + this.ymin)/2;
        this.width = width;
        this.height = height;
        this.xmin = (this.ymin-centery)*(width/height)+centerx;
        this.xmax = (this.ymax-centery)*(width/height)+centerx;
        this.plotCanvas.width = width;
        this.plotCanvas.height = height;
        this.drawEverything();
    },
    getXPixel : function(x) { // Converts math coordinates into pixel coordinates.
        return this.width*(x-this.xmin)/(this.xmax-this.xmin);
    },
    getYPixel : function(y) {
        return this.height*(y-this.ymax)/(this.ymin-this.ymax);
    },
    getXCoord : function(x) { // Converts pixel coordinates into math coordinates.
        return this.xmin+x*(this.xmax-this.xmin)/this.width;
    },
    getYCoord : function(y) {
        return this.ymax+y*(this.ymin-this.ymax)/this.height;
    },
    getScale : function() {
       return Math.round(Math.log((this.ymax-this.ymin)/10)/Math.LN10);
    },
    moveToCoord : function(x, y) { // Starts a line.
        this.plotContext.moveTo(this.getXPixel(x),this.getYPixel(y));
    },
    lineToCoord : function(x, y) { // Ends a line.
        this.plotContext.lineTo(this.getXPixel(x),this.getYPixel(y));
    },
    clear : function() {
        this.plotCanvas.height = this.plotCanvas.height; // This is not a mistake.
    },
    drawAxes : function () {
        var scale = this.getScale();
        var scaledStep = Math.pow(10, scale);
        this.plotContext.beginPath();
        this.plotContext.strokeStyle = "#AAAAAA";
        this.plotContext.fillStyle = "#AAAAAA";
        this.plotContext.font = "normal 12px Courier new";
        
        this.plotContext.textAlign = "center";
        this.plotContext.textBaseline = "top";
        this.moveToCoord(0, this.ymin);
        this.lineToCoord(0, this.ymax);
        for(var x = Math.ceil(this.xmin/scaledStep)*scaledStep ; x <= this.xmax ; x+=scaledStep) {
            if(Math.abs(x) < scaledStep/10)
                continue;
            this.plotContext.moveTo(this.getXPixel(x),this.getYPixel(0)-5);
            this.plotContext.lineTo(this.getXPixel(x),this.getYPixel(0)+5);
            this.plotContext.fillText(scale >= 0 ? x : Math.round(x/scaledStep) + "e" + scale,
                                      this.getXPixel(x),
                                      Math.min(Math.max(0, this.getYPixel(0)+7), this.height-14));
        }
        
        this.plotContext.textAlign = "right";
        this.plotContext.textBaseline = "middle";
        this.moveToCoord(this.xmin, 0);
        this.lineToCoord(this.xmax, 0);
        for(var y = Math.ceil(this.ymin/scaledStep)*scaledStep ; y <= this.ymax ; y+=scaledStep) {
            if(Math.abs(y) < scaledStep/10)
                continue;
            this.plotContext.moveTo(this.getXPixel(0)-5,this.getYPixel(y));
            this.plotContext.lineTo(this.getXPixel(0)+5,this.getYPixel(y));
            var yText = scale >= 0 ? y + "" : Math.round(y/scaledStep) + "e" + scale;
            this.plotContext.fillText(yText,
                                      Math.min(Math.max(7*yText.length, this.getXPixel(0)-7), this.width-1),
                                      this.getYPixel(y));
        }
        this.plotContext.stroke();
    },
    drawFunctions : function() {
        var x = new memoryEntry("x", this.xmin);
        memory.empty();
        memory.push(x);
        var y = [];
        for(var i = 0 ; i < this.functionParseTrees.length ; i++)
            y.push(this.functionParseTrees[i].val());
        
        this.plotContext.beginPath();
        this.plotContext.strokeStyle = "#000000";
        while(x.val < this.xmax) {
            var xPrev = x.val;
            x.val += this.xstep;
            for(var i = 0 ; i < this.functionParseTrees.length ; i++) {
                errorLog = ""; // error log will not be used. probably.
                var nexty = this.functionParseTrees[i].val();
                if(nexty === null || nexty === true || nexty === false || isNaN(nexty) ||
                  ((y[i] > this.ymax || y[i] < this.ymin) && (nexty > this.ymax || nexty < this.ymin))) {
                    y[i] = nexty;
                    continue;
                }
                this.moveToCoord(xPrev, y[i]);
                this.lineToCoord(x.val, nexty);
                y[i] = nexty;
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

function updateMousePosDiv(x, y) {
    var scale = plot.getScale();
    if(scale >= 0)
        mousePosDiv.innerHTML = plot.getXCoord(event.clientX).toFixed(2) + ", " +
                                plot.getYCoord(event.clientY).toFixed(2);
    else
        mousePosDiv.innerHTML = (plot.getXCoord(event.clientX)/Math.pow(10, scale)).toFixed(2) + "e" + scale + ", " +
                                (plot.getYCoord(event.clientY)/Math.pow(10, scale)).toFixed(2) + "e" + scale;
};

var mouseDownFlag = false;
var lastMousePos = {x:0,y:0};
var mousePosDiv = document.getElementById("mousePosition");

window.onload = function() {
    
    plot.init();
    
    document.getElementById("plotControls").onkeyup = function(event) {
        if(event.keyCode !== 13) // enter
            return;
        plot.getParseTrees();
        plot.drawEverything();
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
        if(plot.numberOfFunctions < plot.functionParseTrees.length)
            plot.functionParseTrees.pop();
        plot.drawEverything();
    };
    
    window.onresize = function(event) {
        plot.resize(window.innerWidth, window.innerHeight);
    };
    
    document.getElementById("plot").onmousedown = function(event) { // Starts drag.
        updateMousePosDiv(event.clientX, event.clientY);
        mouseDownFlag = true;
        lastMousePos = {
            x : event.clientX,
            y : event.clientY
        };
    };
    
    document.getElementById("plot").onmouseup = function(event) { // Ends drag.
        mouseDownFlag = false;
    };
    
    document.getElementById("plot").onmouseout = function(event) { // Ends drag.
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
    
    document.getElementById("plot").onmousewheel = function(event) {
        if(event.deltaY > 0)
            plot.zoomOut(1.2);
        if(event.deltaY < 0)
            plot.zoomIn(1.2);
    };
};
