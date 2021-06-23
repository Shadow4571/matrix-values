window.onload = function () {
    clearError();
    document.getElementById("process_button").disabled = true;
};

function changeExpertsCount(count) {
    clearError();
    let matrixElement = document.getElementById("matrix_element");
    matrixElement.innerHTML = "";

    if(count < 2 || count > 20) {
        showError(new Error("Experts count must be between 2 and 20."));
        document.getElementById("process_button").disabled = true;
        return;
    }

    let matrixStyles = window.getComputedStyle(matrixElement);

    let size = Number.parseInt(matrixStyles.width.replace("px", "")) / count;

    for(let i = 0; i < count; i++) {
        for(let j = 0; j < count; j++) {
            let element = document.createElement("div");
            element.className = "matrix_element";
            element.style.width = size + "px";
            element.style.height = size + "px";

            let inputElement = document.createElement("input");
            inputElement.min = "0";
            inputElement.max = "1";
            inputElement.maxLength = 1;
            inputElement.className = "matrix_element_input";

            element.appendChild(inputElement);
            matrixElement.appendChild(element);
        }
    }

    document.getElementById("process_button").disabled = false;
}

function processResult() {
    clearError();
    let matrixElement = document.getElementById("matrix_element");
    let size = Math.sqrt(matrixElement.childElementCount);
    let rawMatrix = [];
    
    try {
        for (let element of matrixElement.children) {
            let rawValue = element.children[0].value;
            if(rawValue === null || rawValue === undefined || rawValue.toString().length < 1) {
                throw new Error("Value in matrix is empty.");
            }

            let value = Number.parseInt(rawValue);
            if(value < 0 || value > 1) {
                throw new Error("Value in matrix must be between 0 and 1.");
            }

            rawMatrix.push(value);
        }

        let matrix = new Matrix(rawMatrix, size);
        let valuesAndVectors = matrix.getValuesAndVectors();

        if(!valuesAndVectors.state) {
            throw new Error(valuesAndVectors.message);
        }

        let coalitionCount = Matrix.coalitionCount(valuesAndVectors);
        let consistencyValue = Matrix.consistencyValue(valuesAndVectors, size);

        showResultBox(coalitionCount, consistencyValue);
    } catch (exp) {
        showError(exp);
        return;
    }
}

function showError(error) {
    if(error instanceof Error) {
        let message = document.getElementById("info_message");
        message.innerHTML = error.message;
    }
}

function clearError() {
    let message = document.getElementById("info_message");
    message.innerHTML = "";
}

function showResultBox(coalition, consistency) {
    let resultConsistency = document.getElementById("result_consistency");
    let resultCoalition = document.getElementById("result_coalition");
    let resultBox = document.getElementById("result_box");
    resultConsistency.innerHTML = consistency.toFixed(2);
    resultCoalition.innerHTML = coalition;
    resultBox.style.display = "block";
}

function closeResultBox() {
    let resultConsistency = document.getElementById("result_consistency");
    let resultCoalition = document.getElementById("result_coalition");
    let resultBox = document.getElementById("result_box");
    resultConsistency.innerHTML = "";
    resultCoalition.innerHTML = "";
    resultBox.style.display = "none";
}