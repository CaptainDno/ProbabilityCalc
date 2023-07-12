const initialPs = new Map();


function onEnter(event, fun, ...args){
    if (event.code === "Enter") fun(...args)
}
function addInitialP(newValue){
    const now = Date.now();
    document.getElementById('initalPs').innerHTML +=
        `<div id="P-chip-${now}" class="chip">${newValue}
<span class="closebtn" onclick="removeInitialP(this)">&times;</span>
</div>`
    initialPs.set(now, newValue);
}
document.getElementById('initialP')
    .addEventListener('keyup', (event) => onEnter(event, addInitialP, event.target.value));

function removeInitialP(element){
    initialPs.delete(Number(element.parentElement.id.split('-')[2]));
    element.parentElement.remove();
}
function process(){
    const worker = new Worker("js/worker.js");
    const mainResultDiv = document.getElementById('resultDiv');
    const processingResult = document.getElementById('processingResult');
    processingResult.innerHTML = "Processing";
    const processingTime = document.getElementById('processingTime');
    const startTime = Date.now();

    const interval = setInterval(() => {
        processingTime.innerHTML = `${(Date.now() - startTime) / 1000} seconds`
    }, 1000);
    const resultTable = document.getElementById('resultTable');
    resultTable.innerHTML = `<tr><th>Try</th><th><math><mrow>P(A)</mrow></math></th><th><math style="font-weight: bold">P(<mover accent="true"><mrow><mi>A</mi></mrow><mo>_</mo></mover>)</math></th><th><math><mrow><msub><mi>P</mi><mn>t</mn></msub><mo>-</mo><mi>P(A)</mi></mrow></math></th></tr>`
    //Show result div
    mainResultDiv.style.display = "block";

    worker.onerror = (err) =>{
        alert(err.message);
        processingResult.innerHTML = `Error: ${err.message}`;
        clearInterval(interval);
    }
    worker.onmessageerror = (err) => console.log(err);

    worker.onmessage = (msg) => {
        if (msg.data.newHtml) resultTable.innerHTML += msg.data.newHtml;
        if (msg.data.result) {
            processingResult.innerHTML = `Result: <u>${msg.data.result}</u>`;
            clearInterval(interval);
            processingTime.innerHTML = `${(Date.now() - startTime) / 1000} seconds`
            worker.terminate();
        }
    }



    worker.postMessage({
        desiredP: Number(document.getElementById('desiredP').value),
        initialPs: Array.from(initialPs.entries(), (entry) => entry[1])
    });
}
