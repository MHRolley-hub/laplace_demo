// Circuit Drawer Module
class CircuitDrawer {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.ns = "http://www.w3.org/2000/svg";
    }

    clear() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    drawSeriesRLC(R, L, C, V) {
        this.clear();
        const startX = 50;
        const startY = 50;
        const width = 300;
        const height = 150;

        // Draw voltage source (left side)
        this.drawVoltageSource(startX, startY + height/2 - 30, 60, `${V}V`);

        // Wire from voltage source to top
        this.drawWire([[startX + 30, startY + height/2 - 30], [startX + 30, startY]]);

        // Top horizontal wire
        this.drawWire([[startX + 30, startY], [startX + width - 20, startY]]);

        // Resistor (top right)
        this.drawResistor(startX + 80, startY, `${R}Ω`);

        // Wire segment
        this.drawWire([[startX + 160, startY], [startX + 200, startY]]);

        // Inductor (continuing top)
        this.drawInductor(startX + 200, startY, `${L}mH`);

        // Right side down wire
        this.drawWire([[startX + width - 20, startY], [startX + width - 20, startY + height]]);

        // Capacitor (bottom)
        this.drawCapacitor(startX + width - 20 - 100, startY + height, `${C}μF`);

        // Bottom horizontal wire
        this.drawWire([[startX + 30, startY + height], [startX + width - 120, startY + height]]);

        // Wire from bottom to voltage source
        this.drawWire([[startX + 30, startY + height], [startX + 30, startY + height/2 + 30]]);

        // Ground symbol
        this.drawGround(startX + 15, startY + height + 10);

        // Current direction arrow
        this.drawArrow(startX + 150, startY - 15, 40, 'I(t)');
    }

    drawParallelRLC(R, L, C, V) {
        this.clear();
        const startX = 50;
        const startY = 40;
        const spacing = 50;

        // Voltage source (left)
        this.drawVoltageSource(startX, startY + 60, 60, `${V}V`);

        // Left vertical wire
        this.drawWire([[startX + 30, startY], [startX + 30, startY + 180]]);

        // Wire from voltage source up
        this.drawWire([[startX + 30, startY + 60], [startX + 30, startY]]);

        // Wire from voltage source down
        this.drawWire([[startX + 30, startY + 120], [startX + 30, startY + 180]]);

        // Top horizontal wire
        this.drawWire([[startX + 30, startY], [startX + 280, startY]]);

        // Bottom horizontal wire
        this.drawWire([[startX + 30, startY + 180], [startX + 280, startY + 180]]);

        // Resistor branch
        this.drawWire([[startX + 100, startY], [startX + 100, startY + 20]]);
        this.drawResistorVertical(startX + 100, startY + 20, `${R}Ω`);
        this.drawWire([[startX + 100, startY + 80], [startX + 100, startY + 180]]);

        // Inductor branch
        this.drawWire([[startX + 170, startY], [startX + 170, startY + 20]]);
        this.drawInductorVertical(startX + 170, startY + 20, `${L}mH`);
        this.drawWire([[startX + 170, startY + 80], [startX + 170, startY + 180]]);

        // Capacitor branch
        this.drawWire([[startX + 240, startY], [startX + 240, startY + 60]]);
        this.drawCapacitorVertical(startX + 240, startY + 60, `${C}μF`);
        this.drawWire([[startX + 240, startY + 120], [startX + 240, startY + 180]]);

        // Ground
        this.drawGround(startX + 15, startY + 190);
    }

    drawWire(points) {
        const path = document.createElementNS(this.ns, "path");
        let d = `M ${points[0][0]} ${points[0][1]}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i][0]} ${points[i][1]}`;
        }
        path.setAttribute("d", d);
        path.setAttribute("class", "svg-wire");
        this.svg.appendChild(path);
    }

    drawResistor(x, y, label) {
        const rect = document.createElementNS(this.ns, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y - 8);
        rect.setAttribute("width", 60);
        rect.setAttribute("height", 16);
        rect.setAttribute("class", "svg-component");
        rect.setAttribute("fill", "#f4e4c1");
        this.svg.appendChild(rect);

        this.drawLabel(x + 30, y - 20, label);
    }

    drawResistorVertical(x, y, label) {
        const rect = document.createElementNS(this.ns, "rect");
        rect.setAttribute("x", x - 8);
        rect.setAttribute("y", y);
        rect.setAttribute("width", 16);
        rect.setAttribute("height", 60);
        rect.setAttribute("class", "svg-component");
        rect.setAttribute("fill", "#f4e4c1");
        this.svg.appendChild(rect);

        this.drawLabel(x + 20, y + 30, label);
    }

    drawInductor(x, y, label) {
        const coils = 4;
        const coilWidth = 12;
        let path = `M ${x} ${y}`;

        for (let i = 0; i < coils; i++) {
            const cx = x + i * coilWidth;
            path += ` Q ${cx + coilWidth/2} ${y - 15} ${cx + coilWidth} ${y}`;
        }

        const pathElement = document.createElementNS(this.ns, "path");
        pathElement.setAttribute("d", path);
        pathElement.setAttribute("class", "svg-component");
        pathElement.setAttribute("stroke", "#4a90e2");
        pathElement.setAttribute("stroke-width", "2.5");
        this.svg.appendChild(pathElement);

        this.drawLabel(x + 24, y - 25, label);
    }

    drawInductorVertical(x, y, label) {
        const coils = 4;
        const coilHeight = 12;
        let path = `M ${x} ${y}`;

        for (let i = 0; i < coils; i++) {
            const cy = y + i * coilHeight;
            path += ` Q ${x + 15} ${cy + coilHeight/2} ${x} ${cy + coilHeight}`;
        }

        const pathElement = document.createElementNS(this.ns, "path");
        pathElement.setAttribute("d", path);
        pathElement.setAttribute("class", "svg-component");
        pathElement.setAttribute("stroke", "#4a90e2");
        pathElement.setAttribute("stroke-width", "2.5");
        this.svg.appendChild(pathElement);

        this.drawLabel(x + 25, y + 30, label);
    }

    drawCapacitor(x, y, label) {
        // Two parallel lines
        const line1 = document.createElementNS(this.ns, "line");
        line1.setAttribute("x1", x);
        line1.setAttribute("y1", y - 15);
        line1.setAttribute("x2", x);
        line1.setAttribute("y2", y + 15);
        line1.setAttribute("class", "svg-component");
        line1.setAttribute("stroke", "#e74c3c");
        line1.setAttribute("stroke-width", "3");
        this.svg.appendChild(line1);

        const line2 = document.createElementNS(this.ns, "line");
        line2.setAttribute("x1", x + 10);
        line2.setAttribute("y1", y - 15);
        line2.setAttribute("x2", x + 10);
        line2.setAttribute("y2", y + 15);
        line2.setAttribute("class", "svg-component");
        line2.setAttribute("stroke", "#e74c3c");
        line2.setAttribute("stroke-width", "3");
        this.svg.appendChild(line2);

        this.drawLabel(x + 5, y + 30, label);
    }

    drawCapacitorVertical(x, y, label) {
        const line1 = document.createElementNS(this.ns, "line");
        line1.setAttribute("x1", x - 15);
        line1.setAttribute("y1", y);
        line1.setAttribute("x2", x + 15);
        line1.setAttribute("y2", y);
        line1.setAttribute("class", "svg-component");
        line1.setAttribute("stroke", "#e74c3c");
        line1.setAttribute("stroke-width", "3");
        this.svg.appendChild(line1);

        const line2 = document.createElementNS(this.ns, "line");
        line2.setAttribute("x1", x - 15);
        line2.setAttribute("y1", y + 10);
        line2.setAttribute("x2", x + 15);
        line2.setAttribute("y2", y + 10);
        line2.setAttribute("class", "svg-component");
        line2.setAttribute("stroke", "#e74c3c");
        line2.setAttribute("stroke-width", "3");
        this.svg.appendChild(line2);

        this.drawLabel(x + 25, y + 5, label);
    }

    drawVoltageSource(x, y, height, label) {
        const circle = document.createElementNS(this.ns, "circle");
        circle.setAttribute("cx", x + 30);
        circle.setAttribute("cy", y + height/2);
        circle.setAttribute("r", 25);
        circle.setAttribute("class", "svg-voltage-source");
        circle.setAttribute("fill", "white");
        this.svg.appendChild(circle);

        // Plus sign
        const plus1 = document.createElementNS(this.ns, "line");
        plus1.setAttribute("x1", x + 23);
        plus1.setAttribute("y1", y + height/2 - 10);
        plus1.setAttribute("x2", x + 37);
        plus1.setAttribute("y2", y + height/2 - 10);
        plus1.setAttribute("stroke", "#d32f2f");
        plus1.setAttribute("stroke-width", "2");
        this.svg.appendChild(plus1);

        const plus2 = document.createElementNS(this.ns, "line");
        plus2.setAttribute("x1", x + 30);
        plus2.setAttribute("y1", y + height/2 - 17);
        plus2.setAttribute("x2", x + 30);
        plus2.setAttribute("y2", y + height/2 - 3);
        plus2.setAttribute("stroke", "#d32f2f");
        plus2.setAttribute("stroke-width", "2");
        this.svg.appendChild(plus2);

        // Minus sign
        const minus = document.createElementNS(this.ns, "line");
        minus.setAttribute("x1", x + 23);
        minus.setAttribute("y1", y + height/2 + 10);
        minus.setAttribute("x2", x + 37);
        minus.setAttribute("y2", y + height/2 + 10);
        minus.setAttribute("stroke", "#d32f2f");
        minus.setAttribute("stroke-width", "2");
        this.svg.appendChild(minus);

        this.drawLabel(x - 5, y + height/2, label);
    }

    drawGround(x, y) {
        const lines = [20, 13, 6];
        for (let i = 0; i < lines.length; i++) {
            const line = document.createElementNS(this.ns, "line");
            line.setAttribute("x1", x + 15 - lines[i]/2);
            line.setAttribute("y1", y + i * 5);
            line.setAttribute("x2", x + 15 + lines[i]/2);
            line.setAttribute("y2", y + i * 5);
            line.setAttribute("stroke", "#333");
            line.setAttribute("stroke-width", "2");
            this.svg.appendChild(line);
        }

        const vertLine = document.createElementNS(this.ns, "line");
        vertLine.setAttribute("x1", x + 15);
        vertLine.setAttribute("y1", y - 10);
        vertLine.setAttribute("x2", x + 15);
        vertLine.setAttribute("y2", y);
        vertLine.setAttribute("stroke", "#333");
        vertLine.setAttribute("stroke-width", "2");
        this.svg.appendChild(vertLine);
    }

    drawArrow(x, y, length, label) {
        const arrow = document.createElementNS(this.ns, "line");
        arrow.setAttribute("x1", x);
        arrow.setAttribute("y1", y);
        arrow.setAttribute("x2", x + length);
        arrow.setAttribute("y2", y);
        arrow.setAttribute("stroke", "#2ecc71");
        arrow.setAttribute("stroke-width", "2");
        arrow.setAttribute("marker-end", "url(#arrowhead)");
        this.svg.appendChild(arrow);

        // Define arrowhead marker if it doesn't exist
        if (!document.getElementById('arrowhead')) {
            const defs = document.createElementNS(this.ns, "defs");
            const marker = document.createElementNS(this.ns, "marker");
            marker.setAttribute("id", "arrowhead");
            marker.setAttribute("markerWidth", "10");
            marker.setAttribute("markerHeight", "10");
            marker.setAttribute("refX", "9");
            marker.setAttribute("refY", "3");
            marker.setAttribute("orient", "auto");

            const polygon = document.createElementNS(this.ns, "polygon");
            polygon.setAttribute("points", "0 0, 10 3, 0 6");
            polygon.setAttribute("fill", "#2ecc71");
            marker.appendChild(polygon);
            defs.appendChild(marker);
            this.svg.insertBefore(defs, this.svg.firstChild);
        }

        this.drawLabel(x + length/2, y - 10, label, "#2ecc71");
    }

    drawLabel(x, y, text, color = "#333") {
        const label = document.createElementNS(this.ns, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", y);
        label.setAttribute("class", "svg-label");
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("fill", color);
        label.textContent = text;
        this.svg.appendChild(label);
    }
}
