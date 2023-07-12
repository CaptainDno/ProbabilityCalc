class Processor {
    _currentRow = 0;
    _data = [];
    maxDiff;
    desiredP;
    initialPs;
    constructor(desiredP, initialPs) {
        this.maxDiff = desiredP - Math.min(...initialPs);
        this.desiredP = desiredP;
        this.initialPs = initialPs;
        if (initialPs.length < 1) throw new Error("Provide initial probability!")
        if (this.maxDiff < 0) throw new Error("The maximum difference between desired and initial probability is negative!");
    }
    get nextRow(){
        return ++this._currentRow;
    }

    process() {
        let currentP;
        let currentNP = 1;
        while (true){
            currentP = this.initialPs.shift() || currentP;
            currentNP *= (1 - currentP);
            if (this.processRow(currentNP)){
                this.generateTableRows();
                this._data = [];
                return this._currentRow;
            }
        }
    }

    processRow(currentNP) {
        const p = 1 - currentNP;
        const diff = Math.max(0, this.desiredP - p);
        const k = diff / this.maxDiff;
        this._data.push({
            k,
            row: this.nextRow,
            p,
            np: currentNP,
            diff});

        if (this._data.length >= 10) {
            this.generateTableRows();
            this._data = [];
        }

        return diff === 0;
    }
    generateTableRows(){
        postMessage({
            newHtml: this._data.reduce((acc, row) => {
                return acc + `<tr><td style="border-left-color: rgb(${255 * row.k}, ${255 * (1 - row.k)}, 0)">${row.row}</td><td>${row.p}</td><td>${row.np}</td><td>${row.diff}</td></tr>`
            }, "")
        })
    }
}

/**
 * Start calculations
 * @param event
 */
onmessage = function(event){

    const processor = new Processor(event.data.desiredP, event.data.initialPs);
    const res = processor.process();
    console.log("result");
    postMessage({
        result: res
    })
}