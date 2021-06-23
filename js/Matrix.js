class Matrix {
    static epsilon = 1e-12;

    constructor(rawMatrix, size) {
        this.arr = Matrix.createArray(size);
        this.size = size;
        this.fullSize = size * size;

        for(let i = 0; i < size; i++) {
            this.arr[i] = Matrix.createArray(size);
            for(let j = 0; j < size; j++) {
                this.arr[i][j] = rawMatrix[i * size + j];
            }
        }
    }

    getCopy() {
        let rawMatrix = [];

        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                rawMatrix[i * this.size + j] = this.arr[i][j];
            }
        }

        return new Matrix(rawMatrix, this.size);
    }

    getArray() {
        let array = new Array(this.size);
        for(let i = 0; i < this.size; i++) {
            array[i] = new Array(this.size);
            for(let j = 0; j < this.size; j++) {
                array[i][j] = this.arr[i][j];
            }
        }

        return array;
    }

    isReal() {
        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                if(!Number.isInteger(this.arr[i][j])) {
                    return false;
                }
            }
        }

        return true;
    }

    isSymmetric() {
        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                if(this.arr[i][j] - this.arr[j][i]) {
                    return false;
                }
            }
        }

        return true;
    }

    getValuesAndVectors() {
        let result = {values: undefined, vectors: undefined, message: "Matrix contains not number values.", state: false};

        if(!this.isReal()) {
            return result;
        }

        if(!this.isSymmetric()) {
            result.message = "Matrix is not symmetric.";
            return result;
        }

        let valuesAndVectors = Matrix.calculateDiagonal(this.getCopy());
        result.values = valuesAndVectors.values;
        result.vectors = valuesAndVectors.vectors;
        result.message = "OK";
        result.state = true;
        return result;
    }

    static getIdentityMatrix(size) {
        let result = new Array(size);
        for(let i = 0; i < size; i++) {
            result[i] = this.createArray(size, 0);
            result[i][i] = 1;
        }

        return result;
    }

    static getIdentityInverse(Sij, theta, i, j) {
        const N = Sij.length;
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const Ski = this.createArray(N, 0);
        const Skj = this.createArray(N, 0);

        for (let k = 0; k < N; k++) {
            Ski[k] = c * Sij[k][i] - s * Sij[k][j];
            Skj[k] = s * Sij[k][i] + c * Sij[k][j];
        }

        for (let k = 0; k < N; k++) {
            Sij[k][i] = Ski[k];
            Sij[k][j] = Skj[k];
        }

        return Sij
    }

    static getMaxAij(array, size) {
        let max = 0;
        let position = {i: 0, j: 1};
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (Math.abs(max) < Math.abs(array[i][j])) {
                    max = Math.abs(array[i][j]);
                    position.i = i;
                    position.j = j;
                }
            }
        }

        return {position: position, value: max};
    }

    static getTheta (aii, ajj, aij) {
        const denom = (ajj - aii);
        if (Math.abs(denom) <= this.epsilon) {
            return Math.PI / 4.0;
        } else {
            return 0.5 * Math.atan(2.0 * aij / (ajj - aii));
        }
    }

    static getInverse (Hij, theta, i, j) {
        const N = Hij.length;
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const c2 = c * c;
        const s2 = s * s;
        let Aki = this.createArray(N, 0);
        let Akj = this.createArray(N, 0);

        const Aii = c2 * Hij[i][i] - 2 * c * s * Hij[i][j] + s2 * Hij[j][j];
        const Ajj = s2 * Hij[i][i] + 2 * c * s * Hij[i][j] + c2 * Hij[j][j];

        for (let k = 0; k < N; k++) {
            Aki[k] = c * Hij[i][k] - s * Hij[j][k];
            Akj[k] = s * Hij[i][k] + c * Hij[j][k];
        }

        Hij[i][i] = Aii;
        Hij[j][j] = Ajj;
        Hij[i][j] = 0;
        Hij[j][i] = 0;

        for (let k = 0; k < N; k++) {
            if (k !== i && k !== j) {
                Hij[i][k] = Aki[k];
                Hij[k][i] = Aki[k];
                Hij[j][k] = Akj[k];
                Hij[k][j] = Akj[k];
            }
        }

        return Hij;
    }

    static calculateDiagonal(matrix) {
        if(!matrix instanceof Matrix) {
            throw new Error("Input parameter must be 'Matrix' class.");
        }

        let psi;
        let size = matrix.size;
        let e0 = Math.abs(this.epsilon / size);
        let identity = this.getIdentityMatrix(size);
        let maxIJ = this.getMaxAij(matrix.arr, size);
        let array = matrix.getArray();

        while (Math.abs(maxIJ.value) >= e0) {
            const i = maxIJ.position.i;
            const j = maxIJ.position.j;
            psi = this.getTheta(array[i][i], array[j][j], array[i][j]);
            array = this.getInverse(array, psi, i, j);
            identity = this.getIdentityInverse(identity, psi, i, j);
            maxIJ = this.getMaxAij(array, size);
        }

        const eIdent = this.createArray(size, 0);
        for(let i = 0; i < size; i++) {
            eIdent[i] = array[i][i];
        }

        return this.sorting(eIdent, identity);
    }

    static createArray(size) {
        return this.createArray(size, undefined);
    }

    static createArray(size, value) {
        let array = new Array(size);

        if(value === null || value === undefined) {
            return array;
        }

        for(let i = 0; i < size; i++) {
            array[i] = value;
        }

        return array;
    }

    static sorting (E, S) {
        const N = E.length;
        const values = Array(N);
        const vectors = Array(N);

        for (let k = 0; k < N; k++) {
            vectors[k] = Array(N);
        }

        for (let i = 0; i < N; i++) {
            let minID = 0;
            let minE = E[0];

            for (let j = 0; j < E.length; j++) {
                if (Math.abs(E[j]) < Math.abs(minE)) {
                    minID = j;
                    minE = E[minID];
                }
            }

            values[i] = E.splice(minID, 1)[0];
            for (let k = 0; k < N; k++) {
                vectors[k][i] = S[k][minID];
                S[k].splice(minID, 1);
            }
        }

        return { values: values, vectors: vectors };
    }

    static coalitionCount(valuesAndVectors) {
        if(!("values" in valuesAndVectors && "vectors" in valuesAndVectors)) {
            throw new Error("Incorrect input parameter.");
        }

        let count = 0;
        for(let value of valuesAndVectors.values) {
            if(value > 0) {
                count++;
            }
        }

        return count;
    }

    static consistencyValue(valuesAndVectors, expertsCount) {
        if(!("values" in valuesAndVectors && "vectors" in valuesAndVectors)) {
            throw new Error("Incorrect input parameter.");
        }

        let max = valuesAndVectors.values[0];
        for(let value of valuesAndVectors.values) {
            max = value > max ? value : max;
        }

        return max / (expertsCount - 1);
    }
}