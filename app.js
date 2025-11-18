// Main Application
class RLCApp {
    constructor() {
        this.solver = new LaplaceSolver();
        this.circuitDrawer = new CircuitDrawer('circuitSvg');
        this.graphPlotter = new GraphPlotter('responseGraph');

        this.initializeElements();
        this.attachEventListeners();
        this.updateCircuit();
    }

    initializeElements() {
        // Input elements
        this.circuitTypeSelect = document.getElementById('circuitType');
        this.voltageInput = document.getElementById('voltage');
        this.resistanceInput = document.getElementById('resistance');
        this.inductanceInput = document.getElementById('inductance');
        this.capacitanceInput = document.getElementById('capacitance');
        this.solveBtn = document.getElementById('solveBtn');

        // Method selection
        this.methodRadios = document.querySelectorAll('input[name="method"]');

        // Display elements
        this.transferFunctionDiv = document.getElementById('transferFunction');
        this.polesDiv = document.getElementById('poles');
        this.residuesDiv = document.getElementById('residues');
        this.timeDomainSolutionDiv = document.getElementById('timeDomainSolution');

        // Pole visibility checkboxes
        this.showPole1Check = document.getElementById('showPole1');
        this.showPole2Check = document.getElementById('showPole2');
        this.showTotalCheck = document.getElementById('showTotal');

        // Pole labels
        this.pole1Label = document.getElementById('pole1Label');
        this.pole2Label = document.getElementById('pole2Label');
    }

    attachEventListeners() {
        // Circuit type change
        this.circuitTypeSelect.addEventListener('change', () => {
            this.updateCircuit();
        });

        // Parameter changes - update circuit diagram
        [this.voltageInput, this.resistanceInput, this.inductanceInput, this.capacitanceInput].forEach(input => {
            input.addEventListener('input', () => {
                this.updateCircuitDiagram();
            });
        });

        // Solve button
        this.solveBtn.addEventListener('click', () => {
            this.solveCircuit();
        });

        // Method selection changes
        this.methodRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (this.solver.poles.length > 0) {
                    this.updateSolution();
                    this.updateGraph();
                }
            });
        });

        // Pole visibility changes
        [this.showPole1Check, this.showPole2Check, this.showTotalCheck].forEach(check => {
            check.addEventListener('change', () => {
                if (this.solver.poles.length > 0) {
                    this.updateGraph();
                }
            });
        });

        // Allow Enter key to solve
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.solveCircuit();
            }
        });
    }

    updateCircuit() {
        this.updateCircuitDiagram();
        // Clear previous results when circuit type changes
        this.clearResults();
    }

    updateCircuitDiagram() {
        const V = parseFloat(this.voltageInput.value);
        const R = parseFloat(this.resistanceInput.value);
        const L = parseFloat(this.inductanceInput.value);
        const C = parseFloat(this.capacitanceInput.value);
        const type = this.circuitTypeSelect.value;

        if (type === 'series') {
            this.circuitDrawer.drawSeriesRLC(R, L, C, V);
        } else {
            this.circuitDrawer.drawParallelRLC(R, L, C, V);
        }
    }

    solveCircuit() {
        // Get input values
        const V = parseFloat(this.voltageInput.value);
        const R = parseFloat(this.resistanceInput.value);
        const L = parseFloat(this.inductanceInput.value);
        const C = parseFloat(this.capacitanceInput.value);
        const type = this.circuitTypeSelect.value;

        // Validate inputs
        if (isNaN(V) || isNaN(R) || isNaN(L) || isNaN(C)) {
            alert('Please enter valid numbers for all parameters');
            return;
        }

        if (R <= 0 || L <= 0 || C <= 0) {
            alert('R, L, and C must be positive values');
            return;
        }

        // Solve based on circuit type
        try {
            if (type === 'series') {
                this.solver.solveSeriesRLC(V, R, L, C);
                this.solver.circuitType = 'series';
            } else {
                this.solver.solveParallelRLC(V, R, L, C);
                this.solver.circuitType = 'parallel';
            }

            // Update displays
            this.updateTransferFunction();
            this.updatePoles();
            this.updateResidues();
            this.updateSolution();
            this.updateGraph();
            this.updatePoleLabels();

        } catch (error) {
            alert('Error solving circuit: ' + error.message);
            console.error(error);
        }
    }

    updateTransferFunction() {
        const tf = this.solver.transferFunction;
        this.transferFunctionDiv.innerHTML = `
            <strong>Transfer Function H(s):</strong><br>
            Numerator: ${tf.numerator}<br>
            Denominator: ${tf.denominator}<br>
            Simplified: ${tf.simplified}
        `;
    }

    updatePoles() {
        const poles = this.solver.poles;
        let html = '<strong>Poles (roots of denominator):</strong><br>';

        poles.forEach((pole, i) => {
            html += this.solver.formatPole(pole, i) + '<br>';
        });

        // Add analysis
        const p1 = poles[0];
        if (p1.type === 'complex') {
            const zeta = -p1.real / Math.sqrt(p1.real * p1.real + p1.imag * p1.imag);
            const wn = Math.sqrt(p1.real * p1.real + p1.imag * p1.imag);
            html += `<br><strong>System Characteristics:</strong><br>`;
            html += `Type: Underdamped (Complex Poles)<br>`;
            html += `Damping ratio (ζ): ${zeta.toFixed(4)}<br>`;
            html += `Natural frequency (ωₙ): ${wn.toFixed(3)} rad/s<br>`;
            html += `Damped frequency (ωd): ${Math.abs(p1.imag).toFixed(3)} rad/s`;
        } else {
            if (Math.abs(poles[0].real - poles[1].real) < 1e-6) {
                html += `<br><strong>System Type:</strong> Critically Damped`;
            } else {
                html += `<br><strong>System Type:</strong> Overdamped (Real Poles)`;
            }
        }

        this.polesDiv.innerHTML = html;
    }

    updateResidues() {
        const residues = this.solver.residues;
        let html = '<strong>Residues (Partial Fraction Coefficients):</strong><br>';

        residues.forEach((residue, i) => {
            html += this.solver.formatResidue(residue, i) + '<br>';
        });

        this.residuesDiv.innerHTML = html;
    }

    updateSolution() {
        const selectedMethod = document.querySelector('input[name="method"]:checked').value;
        const solution = this.solver.getTimeDomainSolution(selectedMethod);
        this.timeDomainSolutionDiv.innerHTML = solution;
    }

    updateGraph() {
        const showPole1 = this.showPole1Check.checked;
        const showPole2 = this.showPole2Check.checked;
        const showTotal = this.showTotalCheck.checked;

        this.graphPlotter.plot(this.solver, showPole1, showPole2, showTotal);
    }

    updatePoleLabels() {
        const poles = this.solver.poles;

        if (poles[0].type === 'complex') {
            this.pole1Label.textContent = `Pole 1 (${poles[0].real.toFixed(2)} + j${poles[0].imag.toFixed(2)})`;
            this.pole2Label.textContent = `Pole 2 (${poles[1].real.toFixed(2)} - j${Math.abs(poles[1].imag).toFixed(2)})`;
        } else {
            this.pole1Label.textContent = `Pole 1 (${poles[0].real.toFixed(4)})`;
            this.pole2Label.textContent = `Pole 2 (${poles[1].real.toFixed(4)})`;
        }
    }

    clearResults() {
        this.transferFunctionDiv.innerHTML = '<em>Click "Solve Circuit" to see results</em>';
        this.polesDiv.innerHTML = '';
        this.residuesDiv.innerHTML = '';
        this.timeDomainSolutionDiv.innerHTML = '';
        this.graphPlotter.clear();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RLCApp();
    console.log('RLC Laplace Solver initialized');
});
