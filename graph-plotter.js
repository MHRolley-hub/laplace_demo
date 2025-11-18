// Graph Plotter for Time Domain Response
class GraphPlotter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.padding = { top: 40, right: 40, bottom: 60, left: 80 };
        this.plotWidth = this.width - this.padding.left - this.padding.right;
        this.plotHeight = this.height - this.padding.top - this.padding.bottom;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Plot the complete response with individual pole contributions
     */
    plot(solver, showPole1, showPole2, showTotal) {
        this.clear();

        // Determine time range based on poles
        const timeRange = this.calculateTimeRange(solver.poles);
        const numPoints = 500;
        const dt = timeRange / numPoints;

        // Calculate all responses
        const times = [];
        const totalResponse = [];
        const pole1Response = [];
        const pole2Response = [];

        let yMin = Infinity;
        let yMax = -Infinity;

        for (let i = 0; i <= numPoints; i++) {
            const t = i * dt;
            times.push(t);

            const total = solver.evaluateResponse(t);
            totalResponse.push(total);

            const p1 = solver.evaluatePoleContribution(0, t);
            pole1Response.push(p1);

            const p2 = solver.evaluatePoleContribution(1, t);
            pole2Response.push(p2);

            // Update min/max for scaling
            if (showTotal) {
                yMin = Math.min(yMin, total);
                yMax = Math.max(yMax, total);
            }
            if (showPole1) {
                yMin = Math.min(yMin, p1);
                yMax = Math.max(yMax, p1);
            }
            if (showPole2) {
                yMin = Math.min(yMin, p2);
                yMax = Math.max(yMax, p2);
            }
        }

        // Add some margin to y-axis
        const yMargin = (yMax - yMin) * 0.1;
        yMin -= yMargin;
        yMax += yMargin;

        // Draw grid and axes
        this.drawGrid(0, timeRange, yMin, yMax);
        this.drawAxes(0, timeRange, yMin, yMax);

        // Plot individual pole contributions
        if (showPole1) {
            this.plotLine(times, pole1Response, 0, timeRange, yMin, yMax, '#e74c3c', 2, 'Pole 1');
        }

        if (showPole2) {
            this.plotLine(times, pole2Response, 0, timeRange, yMin, yMax, '#3498db', 2, 'Pole 2');
        }

        // Plot total response
        if (showTotal) {
            this.plotLine(times, totalResponse, 0, timeRange, yMin, yMax, '#2ecc71', 3, 'Total');
        }

        // Draw legend
        this.drawLegend(showPole1, showPole2, showTotal, solver.poles);

        // Draw title
        this.drawTitle('Time Domain Response');
    }

    /**
     * Calculate appropriate time range based on pole locations
     */
    calculateTimeRange(poles) {
        const p1 = poles[0];

        if (p1.type === 'complex') {
            // For oscillatory response, use damping factor
            const alpha = Math.abs(p1.real);
            if (alpha > 0.01) {
                // Show about 5 time constants
                return 5 / alpha;
            } else {
                // Very lightly damped or undamped, show several periods
                const omega = Math.abs(p1.imag);
                const period = 2 * Math.PI / omega;
                return 10 * period;
            }
        } else {
            // For exponential response, use slowest pole
            const tau1 = Math.abs(1 / p1.real);
            const tau2 = Math.abs(1 / poles[1].real);
            const tau = Math.max(tau1, tau2);
            return 5 * tau; // Show 5 time constants
        }
    }

    /**
     * Transform data coordinates to canvas coordinates
     */
    dataToCanvas(x, y, xMin, xMax, yMin, yMax) {
        const canvasX = this.padding.left + (x - xMin) / (xMax - xMin) * this.plotWidth;
        const canvasY = this.padding.top + this.plotHeight - (y - yMin) / (yMax - yMin) * this.plotHeight;
        return { x: canvasX, y: canvasY };
    }

    /**
     * Draw grid lines
     */
    drawGrid(xMin, xMax, yMin, yMax) {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;

        // Vertical grid lines
        const xSteps = 10;
        for (let i = 0; i <= xSteps; i++) {
            const x = xMin + (xMax - xMin) * i / xSteps;
            const pos = this.dataToCanvas(x, 0, xMin, xMax, yMin, yMax);

            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, this.padding.top);
            this.ctx.lineTo(pos.x, this.padding.top + this.plotHeight);
            this.ctx.stroke();
        }

        // Horizontal grid lines
        const ySteps = 8;
        for (let i = 0; i <= ySteps; i++) {
            const y = yMin + (yMax - yMin) * i / ySteps;
            const pos = this.dataToCanvas(0, y, xMin, xMax, yMin, yMax);

            this.ctx.beginPath();
            this.ctx.moveTo(this.padding.left, pos.y);
            this.ctx.lineTo(this.padding.left + this.plotWidth, pos.y);
            this.ctx.stroke();
        }
    }

    /**
     * Draw axes with labels
     */
    drawAxes(xMin, xMax, yMin, yMax) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';

        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top + this.plotHeight);
        this.ctx.lineTo(this.padding.left + this.plotWidth, this.padding.top + this.plotHeight);
        this.ctx.stroke();

        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding.left, this.padding.top);
        this.ctx.lineTo(this.padding.left, this.padding.top + this.plotHeight);
        this.ctx.stroke();

        // X-axis labels
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        const xSteps = 10;
        for (let i = 0; i <= xSteps; i += 2) {
            const x = xMin + (xMax - xMin) * i / xSteps;
            const pos = this.dataToCanvas(x, 0, xMin, xMax, yMin, yMax);
            this.ctx.fillText(x.toFixed(3), pos.x, this.padding.top + this.plotHeight + 5);
        }

        // X-axis title
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('Time (seconds)', this.padding.left + this.plotWidth / 2, this.height - 20);

        // Y-axis labels
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        const ySteps = 8;
        for (let i = 0; i <= ySteps; i += 2) {
            const y = yMin + (yMax - yMin) * i / ySteps;
            const pos = this.dataToCanvas(0, y, xMin, xMax, yMin, yMax);
            this.ctx.fillText(y.toFixed(3), this.padding.left - 10, pos.y);
        }

        // Y-axis title
        this.ctx.save();
        this.ctx.font = 'bold 14px Arial';
        this.ctx.translate(20, this.padding.top + this.plotHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Response (A or V)', 0, 0);
        this.ctx.restore();
    }

    /**
     * Plot a line on the graph
     */
    plotLine(xData, yData, xMin, xMax, yMin, yMax, color, lineWidth, label) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();

        for (let i = 0; i < xData.length; i++) {
            const pos = this.dataToCanvas(xData[i], yData[i], xMin, xMax, yMin, yMax);

            if (i === 0) {
                this.ctx.moveTo(pos.x, pos.y);
            } else {
                this.ctx.lineTo(pos.x, pos.y);
            }
        }

        this.ctx.stroke();
    }

    /**
     * Draw legend
     */
    drawLegend(showPole1, showPole2, showTotal, poles) {
        const legendX = this.padding.left + 20;
        let legendY = this.padding.top + 20;
        const lineLength = 30;
        const spacing = 25;

        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';

        if (showPole1) {
            // Pole 1 line
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(legendX, legendY);
            this.ctx.lineTo(legendX + lineLength, legendY);
            this.ctx.stroke();

            // Pole 1 label
            this.ctx.fillStyle = '#333';
            const pole1Text = poles[0].type === 'complex'
                ? `Pole 1: ${poles[0].real.toFixed(2)} + j${poles[0].imag.toFixed(2)}`
                : `Pole 1: ${poles[0].real.toFixed(3)}`;
            this.ctx.fillText(pole1Text, legendX + lineLength + 10, legendY);

            legendY += spacing;
        }

        if (showPole2) {
            // Pole 2 line
            this.ctx.strokeStyle = '#3498db';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(legendX, legendY);
            this.ctx.lineTo(legendX + lineLength, legendY);
            this.ctx.stroke();

            // Pole 2 label
            this.ctx.fillStyle = '#333';
            const pole2Text = poles[1].type === 'complex'
                ? `Pole 2: ${poles[1].real.toFixed(2)} - j${Math.abs(poles[1].imag).toFixed(2)}`
                : `Pole 2: ${poles[1].real.toFixed(3)}`;
            this.ctx.fillText(pole2Text, legendX + lineLength + 10, legendY);

            legendY += spacing;
        }

        if (showTotal) {
            // Total line
            this.ctx.strokeStyle = '#2ecc71';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(legendX, legendY);
            this.ctx.lineTo(legendX + lineLength, legendY);
            this.ctx.stroke();

            // Total label
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('Total Response', legendX + lineLength + 10, legendY);
        }
    }

    /**
     * Draw plot title
     */
    drawTitle(title) {
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(title, this.padding.left + this.plotWidth / 2, 10);
    }
}
