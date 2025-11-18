// Laplace Transform Solver for RLC Circuits
class LaplaceSolver {
    constructor() {
        this.poles = [];
        this.residues = [];
        this.transferFunction = null;
        this.circuitType = 'series';
        this.method = 'partial_fractions';
    }

    /**
     * Solve series RLC circuit
     * Transfer function: H(s) = V / (L*s^2 + R*s + 1/C)
     */
    solveSeriesRLC(V, R, L, C) {
        // Convert to SI units
        const L_H = L / 1000; // mH to H
        const C_F = C / 1000000; // μF to F

        // For series RLC: V(s)/I(s) = R + sL + 1/(sC)
        // I(s) = V(s) / (R + sL + 1/(sC))
        // I(s) = V*s*C / (L*C*s^2 + R*C*s + 1)

        // Characteristic equation: L*C*s^2 + R*C*s + 1 = 0
        // Standard form: s^2 + (R/L)*s + 1/(L*C) = 0

        const a = L_H * C_F;
        const b = R * C_F;
        const c = 1;

        // Calculate poles using quadratic formula
        this.poles = this.solveQuadratic(a, b, c);

        // For current response with step input V/s:
        // I(s) = (V*C*s) / (L*C*s^2 + R*C*s + 1) * 1/s
        // I(s) = (V*C) / (L*C*s^2 + R*C*s + 1)

        // Calculate residues for partial fraction expansion
        this.calculateResidues(V * C_F, a, b, c);

        this.transferFunction = {
            numerator: `${V} × ${(C_F * 1e6).toFixed(2)}μF`,
            denominator: `${(a * 1e6).toFixed(4)}×10⁻⁶ s² + ${(b * 1e6).toFixed(4)}×10⁻⁶ s + 1`,
            simplified: `V(s) / (Ls² + Rs + 1/C)`
        };

        return {
            poles: this.poles,
            residues: this.residues,
            transferFunction: this.transferFunction
        };
    }

    /**
     * Solve parallel RLC circuit
     * Transfer function for voltage: H(s) = V / (1 + sRC + s^2*LC)
     */
    solveParallelRLC(V, R, L, C) {
        // Convert to SI units
        const L_H = L / 1000; // mH to H
        const C_F = C / 1000000; // μF to F

        // For parallel RLC with voltage source:
        // V(s)/I(s) = 1 / (1/R + 1/(sL) + sC)
        // Characteristic equation: s^2 + s/(RC) + 1/(LC) = 0

        const a = 1;
        const b = 1 / (R * C_F);
        const c = 1 / (L_H * C_F);

        // Calculate poles
        this.poles = this.solveQuadratic(a, b, c);

        // Calculate residues
        this.calculateResidues(V, a, b, c);

        this.transferFunction = {
            numerator: `${V}`,
            denominator: `s² + ${b.toFixed(2)} s + ${c.toFixed(2)}`,
            simplified: `V / (s² + s/(RC) + 1/(LC))`
        };

        return {
            poles: this.poles,
            residues: this.residues,
            transferFunction: this.transferFunction
        };
    }

    /**
     * Solve quadratic equation: a*s^2 + b*s + c = 0
     * Returns array of complex poles
     */
    solveQuadratic(a, b, c) {
        const discriminant = b * b - 4 * a * c;

        if (discriminant >= 0) {
            // Real poles (overdamped)
            const p1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const p2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            return [
                { real: p1, imag: 0, type: 'real' },
                { real: p2, imag: 0, type: 'real' }
            ];
        } else {
            // Complex conjugate poles (underdamped)
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-discriminant) / (2 * a);
            return [
                { real: realPart, imag: imagPart, type: 'complex' },
                { real: realPart, imag: -imagPart, type: 'complex' }
            ];
        }
    }

    /**
     * Calculate residues for partial fraction expansion
     * For F(s) = K / (as^2 + bs + c) = A/(s-p1) + B/(s-p2)
     */
    calculateResidues(K, a, b, c) {
        const p1 = this.poles[0];
        const p2 = this.poles[1];

        if (p1.type === 'complex') {
            // For complex poles, calculate complex residues
            // A = K / (s-p2)|s=p1 = K / (p1 - p2)
            const denominator = this.complexSubtract(p1, p2);
            const r1 = this.complexDivide({ real: K/a, imag: 0 }, denominator);
            const r2 = this.complexConjugate(r1);

            this.residues = [r1, r2];
        } else {
            // Real poles
            const r1 = K / (a * (p1.real - p2.real));
            const r2 = K / (a * (p2.real - p1.real));

            this.residues = [
                { real: r1, imag: 0 },
                { real: r2, imag: 0 }
            ];
        }
    }

    /**
     * Generate time domain solution based on selected method
     */
    getTimeDomainSolution(method) {
        this.method = method;
        let solution = '';

        const p1 = this.poles[0];
        const p2 = this.poles[1];
        const r1 = this.residues[0];
        const r2 = this.residues[1];

        switch (method) {
            case 'partial_fractions':
                solution = this.partialFractionsSolution(p1, p2, r1, r2);
                break;
            case 'residue':
                solution = this.residueSolution(p1, p2, r1, r2);
                break;
            case 'convolution':
                solution = this.convolutionSolution(p1, p2);
                break;
            case 'tables':
                solution = this.tableSolution(p1, p2, r1, r2);
                break;
        }

        return solution;
    }

    partialFractionsSolution(p1, p2, r1, r2) {
        if (p1.type === 'complex') {
            const alpha = -p1.real;
            const omega = Math.abs(p1.imag);
            const A = 2 * r1.real;
            const B = 2 * r1.imag;

            return `<strong>Partial Fractions Method:</strong><br>
                F(s) = A/(s-p₁) + A*/(s-p₁*)<br>
                where p₁ = ${p1.real.toFixed(3)} + j${p1.imag.toFixed(3)}<br>
                A = ${r1.real.toFixed(6)} + j${r1.imag.toFixed(6)}<br><br>
                <strong>Time Domain:</strong><br>
                f(t) = e^(${(-alpha).toFixed(3)}t) × [${(A).toFixed(6)}cos(${omega.toFixed(3)}t) + ${(B).toFixed(6)}sin(${omega.toFixed(3)}t)]`;
        } else {
            return `<strong>Partial Fractions Method:</strong><br>
                F(s) = ${r1.real.toFixed(6)}/(s-${p1.real.toFixed(3)}) + ${r2.real.toFixed(6)}/(s-${p2.real.toFixed(3)})<br><br>
                <strong>Time Domain:</strong><br>
                f(t) = ${r1.real.toFixed(6)}e^(${p1.real.toFixed(3)}t) + ${r2.real.toFixed(6)}e^(${p2.real.toFixed(3)}t)`;
        }
    }

    residueSolution(p1, p2, r1, r2) {
        if (p1.type === 'complex') {
            return `<strong>Residue Method:</strong><br>
                Using residue theorem for complex poles<br>
                Res[F(s)e^(st), s=p] = A×e^(pt)<br>
                p₁ = ${p1.real.toFixed(3)} + j${p1.imag.toFixed(3)}<br>
                p₂ = ${p2.real.toFixed(3)} + j${p2.imag.toFixed(3)}<br><br>
                <strong>Result:</strong> Sum of residues gives oscillatory response`;
        } else {
            return `<strong>Residue Method:</strong><br>
                Res₁ = ${r1.real.toFixed(6)} at pole s = ${p1.real.toFixed(3)}<br>
                Res₂ = ${r2.real.toFixed(6)} at pole s = ${p2.real.toFixed(3)}<br><br>
                <strong>Result:</strong> f(t) = Σ Res[F(s)e^(st), poles]`;
        }
    }

    convolutionSolution(p1, p2) {
        return `<strong>Convolution Theorem:</strong><br>
            f(t) = L⁻¹{F(s)} = L⁻¹{H(s)} * L⁻¹{V(s)}<br>
            where * denotes convolution<br><br>
            Impulse response h(t) determined by poles:<br>
            p₁ = ${p1.real.toFixed(3)} ${p1.imag !== 0 ? '+ j' + p1.imag.toFixed(3) : ''}<br>
            p₂ = ${p2.real.toFixed(3)} ${p2.imag !== 0 ? '+ j' + p2.imag.toFixed(3) : ''}`;
    }

    tableSolution(p1, p2, r1, r2) {
        if (p1.type === 'complex') {
            const alpha = -p1.real;
            const omega = Math.abs(p1.imag);

            return `<strong>Transform Table Method:</strong><br>
                Matching standard form: e^(-αt)cos(ωt) ↔ (s+α)/[(s+α)²+ω²]<br>
                and: e^(-αt)sin(ωt) ↔ ω/[(s+α)²+ω²]<br><br>
                α = ${alpha.toFixed(3)} (damping)<br>
                ω = ${omega.toFixed(3)} (frequency)<br><br>
                <strong>Result:</strong> Damped sinusoidal response`;
        } else {
            return `<strong>Transform Table Method:</strong><br>
                Using: e^(at) ↔ 1/(s-a)<br><br>
                Term 1: ${r1.real.toFixed(6)}e^(${p1.real.toFixed(3)}t)<br>
                Term 2: ${r2.real.toFixed(6)}e^(${p2.real.toFixed(3)}t)`;
        }
    }

    /**
     * Evaluate time domain response at time t
     */
    evaluateResponse(t) {
        const p1 = this.poles[0];
        const p2 = this.poles[1];
        const r1 = this.residues[0];
        const r2 = this.residues[1];

        if (p1.type === 'complex') {
            // Complex poles: oscillatory response
            const alpha = p1.real;
            const omega = p1.imag;
            const expTerm = Math.exp(alpha * t);

            // f(t) = 2*Re(r1 * e^(p1*t))
            // = 2*Re((r1.real + j*r1.imag) * e^(alpha*t) * (cos(omega*t) + j*sin(omega*t)))
            const cosOmegaT = Math.cos(omega * t);
            const sinOmegaT = Math.sin(omega * t);

            const response = expTerm * (
                2 * (r1.real * cosOmegaT - r1.imag * sinOmegaT)
            );

            return response;
        } else {
            // Real poles: exponential response
            const response = r1.real * Math.exp(p1.real * t) +
                           r2.real * Math.exp(p2.real * t);
            return response;
        }
    }

    /**
     * Evaluate individual pole contribution
     */
    evaluatePoleContribution(poleIndex, t) {
        const pole = this.poles[poleIndex];
        const residue = this.residues[poleIndex];

        if (pole.type === 'complex') {
            const expTerm = Math.exp(pole.real * t);
            const cosOmegaT = Math.cos(pole.imag * t);
            const sinOmegaT = Math.sin(pole.imag * t);

            // For complex conjugate pairs, show the real part contribution
            if (poleIndex === 0) {
                // First pole: positive imaginary part
                return expTerm * (residue.real * cosOmegaT - residue.imag * sinOmegaT);
            } else {
                // Second pole: negative imaginary part (conjugate)
                return expTerm * (residue.real * cosOmegaT + residue.imag * sinOmegaT);
            }
        } else {
            return residue.real * Math.exp(pole.real * t);
        }
    }

    // Complex number operations
    complexSubtract(a, b) {
        return {
            real: a.real - b.real,
            imag: a.imag - b.imag
        };
    }

    complexDivide(a, b) {
        const denom = b.real * b.real + b.imag * b.imag;
        return {
            real: (a.real * b.real + a.imag * b.imag) / denom,
            imag: (a.imag * b.real - a.real * b.imag) / denom
        };
    }

    complexConjugate(a) {
        return {
            real: a.real,
            imag: -a.imag
        };
    }

    /**
     * Format pole for display
     */
    formatPole(pole, index) {
        if (pole.type === 'complex') {
            const sign = pole.imag >= 0 ? '+' : '-';
            return `p${index + 1} = ${pole.real.toFixed(3)} ${sign} j${Math.abs(pole.imag).toFixed(3)}`;
        } else {
            return `p${index + 1} = ${pole.real.toFixed(6)}`;
        }
    }

    /**
     * Format residue for display
     */
    formatResidue(residue, index) {
        if (Math.abs(residue.imag) < 1e-10) {
            return `R${index + 1} = ${residue.real.toFixed(6)}`;
        } else {
            const sign = residue.imag >= 0 ? '+' : '-';
            return `R${index + 1} = ${residue.real.toFixed(6)} ${sign} j${Math.abs(residue.imag).toFixed(6)}`;
        }
    }
}
