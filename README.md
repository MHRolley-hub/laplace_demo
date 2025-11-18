# RLC Circuit Laplace Transform Solver

An interactive web application for solving and visualizing RLC circuits using Laplace transforms. This educational tool demonstrates how to analyze series and parallel RLC circuits in both the frequency (Laplace) domain and time domain.

## Features

### Circuit Analysis
- **Dual Circuit Types**: Switch between Series RLC and Parallel RLC configurations
- **Interactive Parameters**: Adjust voltage source, resistance, inductance, and capacitance in real-time
- **Visual Circuit Diagrams**: Auto-generated SVG circuit diagrams that update with your parameters

### Laplace Domain Analysis
- **Transfer Function Calculation**: Automatic computation of H(s) for the selected circuit
- **Pole Extraction**: Calculates complex or real poles from the characteristic equation
- **Residue Calculation**: Computes partial fraction expansion coefficients
- **System Classification**: Identifies underdamped, overdamped, or critically damped responses

### Solution Methods
Choose from four different inverse Laplace transform methods:
1. **Partial Fractions Decomposition**: Classic method for rational functions
2. **Residue Method**: Using the residue theorem for complex poles
3. **Convolution Theorem**: Demonstrates convolution-based approach
4. **Laplace Transform Tables**: Direct table lookup method

### Time Domain Visualization
- **Multi-trace Graphing**: Plot individual pole contributions and total response
- **Dynamic Updates**: Graphs update automatically when changing solution methods
- **Interactive Controls**: Toggle individual pole traces on/off
- **Detailed Annotations**: Legend shows pole locations and values

## How to Use

1. **Open the Application**: Simply open `index.html` in a modern web browser
2. **Select Circuit Type**: Choose between Series or Parallel RLC
3. **Set Parameters**:
   - Voltage Source (V)
   - Resistance (Ω)
   - Inductance (mH)
   - Capacitance (μF)
4. **Solve**: Click "Solve Circuit" or press Enter
5. **Explore**: Try different solution methods and toggle pole contributions

## Example Values

### Underdamped Series RLC (Oscillatory Response)
- Voltage: 10V
- Resistance: 100Ω
- Inductance: 100mH
- Capacitance: 10μF

### Overdamped Series RLC (Exponential Response)
- Voltage: 10V
- Resistance: 1000Ω
- Inductance: 100mH
- Capacitance: 10μF

### Parallel RLC
- Voltage: 5V
- Resistance: 1000Ω
- Inductance: 50mH
- Capacitance: 1μF

## Mathematics Background

### Series RLC Circuit
The characteristic equation is:
```
L·C·s² + R·C·s + 1 = 0
```

Transfer function (current):
```
I(s) = V·C / (L·C·s² + R·C·s + 1)
```

### Parallel RLC Circuit
The characteristic equation is:
```
s² + s/(R·C) + 1/(L·C) = 0
```

### Pole Classification
- **Complex Conjugate Poles**: Underdamped (ζ < 1) - Oscillatory response
- **Real Distinct Poles**: Overdamped (ζ > 1) - Exponential decay
- **Real Repeated Poles**: Critically damped (ζ = 1) - Fastest settling

## Project Structure

```
laplace_demo/
├── index.html              # Main HTML structure
├── style.css               # Styling and layout
├── app.js                  # Main application controller
├── laplace-solver.js       # Laplace transform mathematics
├── circuit-drawer.js       # SVG circuit diagram renderer
├── graph-plotter.js        # Time domain graph plotter
└── README.md              # This file
```

## Technologies Used

- **Pure JavaScript**: No external dependencies
- **HTML5 Canvas**: For high-performance graph plotting
- **SVG**: For scalable circuit diagrams
- **CSS3**: Modern styling with gradients and transitions

## Educational Value

This tool helps students and engineers:
- Visualize the relationship between circuit parameters and system response
- Understand how poles affect time domain behavior
- Compare different inverse Laplace transform methods
- See the contribution of individual poles to the total response
- Learn damping concepts (underdamped, overdamped, critically damped)

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- SVG
- ES6 JavaScript

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential additions:
- RLC circuit with initial conditions
- Step, impulse, and sinusoidal inputs
- Bode plot visualization
- Pole-zero map in s-plane
- Export graphs as images
- More complex circuits (RLC with sources)

## License

MIT License - Feel free to use for educational purposes

## Author

Created as an educational demonstration of Laplace transform analysis for electrical circuits.

## Contributing

Suggestions and improvements are welcome! This is an educational tool designed to help students understand circuit analysis.
