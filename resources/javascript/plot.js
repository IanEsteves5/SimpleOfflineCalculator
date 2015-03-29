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
        this.readControls();
        this.drawAxes();
    },
    readControls : function() {
        this.xstep = (this.xmax-this.xmin)/1000;
    },
    clear : function() {
        this.plotCanvas.height = this.plotCanvas.height;
    },
    getXPixel : function(x) { // converts math coordinates into pixel coordinates
        return this.width*(x-this.xmin)/(this.xmax-this.xmin);
    },
    getYPixel : function(y) {
        return this.height*(y-this.ymax)/(this.ymin-this.ymax);
    },
    moveToCoord : function(x, y) { // starts a line
        this.plotContext.moveTo(this.getXPixel(x),this.getYPixel(y));
    },
    lineToCoord : function(x, y) { // ends a line
        this.plotContext.lineTo(this.getXPixel(x),this.getYPixel(y));
    },
    drawAxes : function () {
        this.plotContext.beginPath();
        this.plotContext.strokeStyle = "#AAAAAA";
        this.moveToCoord(0, this.ymin);
        this.lineToCoord(0, this.ymax);
        this.moveToCoord(this.xmin, 0);
        this.lineToCoord(this.ymax, 0);
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
                if(y[i] === null || isNaN(y[i]))
                    continue;
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

window.onload = function() {
    
    plot.init();
    
    document.onkeyup = function(event) {
        if(event.keyCode !== 13) // enter
            return;
        plot.drawEverything();
    };
};
