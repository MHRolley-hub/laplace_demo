// Main Application
class RLCApp {
    constructor() {
        this.solver = new LaplaceSolver();
        this.graphPlotter = new GraphPlotter('responseGraph');

        this.initializeElements();
        this.attachEventListeners();
        this.updateCircuitImage();
        // Initial solve with default values
        setTimeout(() => this.solveCircuit(), 100);
    }

    initializeElements() {
        // Input elements
        this.circuitTypeSelect = document.getElementById('circuitType');
        this.voltageInput = document.getElementById('voltage');
        this.resistanceInput = document.getElementById('resistance');
        this.inductanceInput = document.getElementById('inductance');
        this.capacitanceInput = document.getElementById('capacitance');

        // Slider elements
        this.voltageSlider = document.getElementById('voltageSlider');
        this.resistanceSlider = document.getElementById('resistanceSlider');
        this.inductanceSlider = document.getElementById('inductanceSlider');
        this.capacitanceSlider = document.getElementById('capacitanceSlider');

        // Value display elements
        this.voltageValue = document.getElementById('voltageValue');
        this.resistanceValue = document.getElementById('resistanceValue');
        this.inductanceValue = document.getElementById('inductanceValue');
        this.capacitanceValue = document.getElementById('capacitanceValue');

        // Circuit images
        this.seriesCircuitImg = document.getElementById('seriesCircuit');
        this.parallelCircuitImg = document.getElementById('parallelCircuit');

        // Input signal elements
        this.signalRadios = document.querySelectorAll('input[name="inputSignal"]');
        this.applySignalBtn = document.getElementById('applySignalBtn');
        this.signalParameters = document.getElementById('signalParameters');
        this.dampingGroup = document.getElementById('dampingGroup');

        this.frequencySlider = document.getElementById('frequencySlider');
        this.frequencyInput = document.getElementById('signalFrequency');
        this.frequencyValue = document.getElementById('frequencyValue');

        this.dampingSlider = document.getElementById('dampingSlider');
        this.dampingInput = document.getElementById('signalDamping');
        this.dampingValue = document.getElementById('dampingValue');

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
            this.updateCircuitImage();
            this.solveCircuit();
        });

        // Voltage slider and input sync
        this.voltageSlider.addEventListener('input', () => {
            const value = parseFloat(this.voltageSlider.value);
            this.voltageInput.value = value;
            this.voltageValue.textContent = value.toFixed(1);
            this.solveCircuit();
        });

        this.voltageInput.addEventListener('input', () => {
            const value = parseFloat(this.voltageInput.value);
            if (!isNaN(value)) {
                this.voltageSlider.value = Math.min(Math.max(value, this.voltageSlider.min), this.voltageSlider.max);
                this.voltageValue.textContent = value.toFixed(1);
                this.solveCircuit();
            }
        });

        // Resistance slider and input sync
        this.resistanceSlider.addEventListener('input', () => {
            const value = parseFloat(this.resistanceSlider.value);
            this.resistanceInput.value = value;
            this.resistanceValue.textContent = value.toFixed(0);
            this.solveCircuit();
        });

        this.resistanceInput.addEventListener('input', () => {
            const value = parseFloat(this.resistanceInput.value);
            if (!isNaN(value)) {
                this.resistanceSlider.value = Math.min(Math.max(value, this.resistanceSlider.min), this.resistanceSlider.max);
                this.resistanceValue.textContent = value.toFixed(0);
                this.solveCircuit();
            }
        });

        // Inductance slider and input sync
        this.inductanceSlider.addEventListener('input', () => {
            const value = parseFloat(this.inductanceSlider.value);
            this.inductanceInput.value = value;
            this.inductanceValue.textContent = value.toFixed(0);
            this.solveCircuit();
        });

        this.inductanceInput.addEventListener('input', () => {
            const value = parseFloat(this.inductanceInput.value);
            if (!isNaN(value)) {
                this.inductanceSlider.value = Math.min(Math.max(value, this.inductanceSlider.min), this.inductanceSlider.max);
                this.inductanceValue.textContent = value.toFixed(0);
                this.solveCircuit();
            }
        });

        // Capacitance slider and input sync
        this.capacitanceSlider.addEventListener('input', () => {
            const value = parseFloat(this.capacitanceSlider.value);
            this.capacitanceInput.value = value;
            this.capacitanceValue.textContent = value.toFixed(1);
            this.solveCircuit();
        });

        this.capacitanceInput.addEventListener('input', () => {
            const value = parseFloat(this.capacitanceInput.value);
            if (!isNaN(value)) {
                this.capacitanceSlider.value = Math.min(Math.max(value, this.capacitanceSlider.min), this.capacitanceSlider.max);
                this.capacitanceValue.textContent = value.toFixed(1);
                this.solveCircuit();
            }
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

        // Input signal type changes
        this.signalRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateSignalParametersVisibility();
            });
        });

        // Frequency slider and input sync
        this.frequencySlider.addEventListener('input', () => {
            const value = parseFloat(this.frequencySlider.value);
            this.frequencyInput.value = value;
            this.frequencyValue.textContent = value.toFixed(0);
        });

        this.frequencyInput.addEventListener('input', () => {
            const value = parseFloat(this.frequencyInput.value);
            if (!isNaN(value)) {
                this.frequencySlider.value = Math.min(Math.max(value, this.frequencySlider.min), this.frequencySlider.max);
                this.frequencyValue.textContent = value.toFixed(0);
            }
        });

        // Damping slider and input sync
        this.dampingSlider.addEventListener('input', () => {
            const value = parseFloat(this.dampingSlider.value);
            this.dampingInput.value = value;
            this.dampingValue.textContent = value.toFixed(1);
        });

        this.dampingInput.addEventListener('input', () => {
            const value = parseFloat(this.dampingInput.value);
            if (!isNaN(value)) {
                this.dampingSlider.value = Math.min(Math.max(value, this.dampingSlider.min), this.dampingSlider.max);
                this.dampingValue.textContent = value.toFixed(1);
            }
        });

        // Apply signal button
        this.applySignalBtn.addEventListener('click', () => {
            this.applyInputSignal();
        });
    }

    updateCircuitImage() {
        const type = this.circuitTypeSelect.value;

        if (type === 'series') {
            this.seriesCircuitImg.style.display = 'block';
            this.parallelCircuitImg.style.display = 'none';
        } else {
            this.seriesCircuitImg.style.display = 'none';
            this.parallelCircuitImg.style.display = 'block';
        }
    }

    solveCircuit() {
        // Get input values
        const V = parseFloat(this.voltageInput.value);
        const R = parseFloat(this.resistanceInput.value);
        const L = parseFloat(this.inductanceInput.value);
        const C = parseFloat(this.capacitanceInput.value);
        const type = this.circuitTypeSelect.value;

        // Validate inputs - silently return if invalid for real-time solving
        if (isNaN(V) || isNaN(R) || isNaN(L) || isNaN(C)) {
            console.log('Waiting for valid input values...');
            return;
        }

        if (R <= 0 || L <= 0 || C <= 0) {
            console.log('R, L, and C must be positive values');
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
            console.error('Error solving circuit:', error);
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

    updateSignalParametersVisibility() {
        const selectedSignal = document.querySelector('input[name="inputSignal"]:checked').value;

        if (selectedSignal === 'step') {
            this.signalParameters.style.display = 'none';
        } else if (selectedSignal === 'damped_sine') {
            this.signalParameters.style.display = 'block';
            this.dampingGroup.style.display = 'block';
        } else {
            // sine or cosine
            this.signalParameters.style.display = 'block';
            this.dampingGroup.style.display = 'none';
        }
    }

    applyInputSignal() {
        const selectedSignal = document.querySelector('input[name="inputSignal"]:checked').value;
        const frequency = parseFloat(this.frequencyInput.value);
        const damping = parseFloat(this.dampingInput.value);

        // Set the input signal type in the solver
        this.solver.inputSignalType = selectedSignal;
        this.solver.inputFrequency = frequency;
        this.solver.inputDamping = damping;

        // Re-solve the circuit with the new input signal
        this.solveCircuit();
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
