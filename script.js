// Polynomial Interpolation Web Interface
class PolynomialInterpolation {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('jsonFile');
        const processBtn = document.getElementById('processBtn');
        const resultsDiv = document.getElementById('results');
        const loadingDiv = document.getElementById('loading');

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                processBtn.disabled = false;
                this.displayMessage('File selected: ' + file.name, 'success');
            }
        });

        processBtn.addEventListener('click', async () => {
            const file = fileInput.files[0];
            if (!file) {
                this.displayMessage('Please select a JSON file first', 'error');
                return;
            }

            try {
                loadingDiv.style.display = 'block';
                resultsDiv.innerHTML = '';
                
                const jsonData = await this.readJsonFile(file);
                const result = await this.processPolynomial(jsonData);
                
                this.displayResults(result);
            } catch (error) {
                this.displayMessage('Error: ' + error.message, 'error');
            } finally {
                loadingDiv.style.display = 'none';
            }
        });
    }

    async readJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    console.log('Parsed JSON data:', jsonData);
                    resolve(jsonData);
                } catch (error) {
                    console.error('JSON parsing error:', error);
                    reject(new Error('Invalid JSON file: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    async processPolynomial(jsonData) {
        console.log('Processing polynomial data:', jsonData);
        
        const keys = jsonData.keys;
        if (!keys || !keys.n || !keys.k) {
            throw new Error('Invalid JSON structure. Expected: { keys: { n, k }, ... }');
        }

        const { n, k } = keys;
        const points = [];

        // Extract points from JSON
        for (const [key, value] of Object.entries(jsonData)) {
            if (key === 'keys') continue;
            
            const x = parseInt(key);
            const base = parseInt(value.base);
            const valueStr = value.value;
            
            // Decode y value from the given base
            const y = parseInt(valueStr, base);
            
            points.push({ x, y, originalValue: valueStr, base });
        }

        console.log('Extracted points:', points);

        if (points.length < k) {
            throw new Error(`Need at least ${k} points, got ${points.length}`);
        }

        // Use Lagrange interpolation to find the constant term (f(0))
        const secret = this.lagrangeInterpolation(points, k, 0);
        
        return {
            input: { n, k, points },
            secret: secret
        };
    }

    // Lagrange interpolation to find f(x) at a given point
    lagrangeInterpolation(points, k, x) {
        let result = 0;
        
        for (let i = 0; i < k; i++) {
            let numerator = 1;
            let denominator = 1;
            
            for (let j = 0; j < k; j++) {
                if (i === j) continue;
                
                numerator *= (x - points[j].x);
                denominator *= (points[i].x - points[j].x);
            }
            
            const lagrangeCoeff = numerator / denominator;
            result += points[i].y * lagrangeCoeff;
        }
        
        return Math.round(result); // Round to nearest integer
    }

    displayResults(data) {
        const resultsDiv = document.getElementById('results');
        
        let html = `
            <div class="result-card">
                <div class="result-title">📊 Input Parameters</div>
                <div class="result-content">n: ${data.input.n}
k: ${data.input.k}
Number of points: ${data.input.points.length}

Points (x, y):
${data.input.points.map(p => `  (${p.x}, ${p.y}) [${p.originalValue} in base ${p.base}]`).join('\n')}</div>
            </div>
        `;

        html += `
            <div class="result-card">
                <div class="result-title">🔐 Secret Constant Term</div>
                <div class="result-content">${data.secret}</div>
            </div>
        `;

        html += `
            <div class="result-card">
                <div class="result-title">📝 Explanation</div>
                <div class="result-content">The secret is the constant term (c) of the polynomial f(x) = aₘxᵐ + aₘ₋₁xᵐ⁻¹ + ... + a₁x + c

This was found using Lagrange interpolation to evaluate f(0), which gives us the constant term c.

Polynomial degree: ${data.input.k - 1}
Points used: ${data.input.k}</div>
            </div>
        `;

        resultsDiv.innerHTML = html;
    }

    displayMessage(message, type) {
        const resultsDiv = document.getElementById('results');
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        resultsDiv.appendChild(messageDiv);
        
        console.log(`${type.toUpperCase()}: ${message}`);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Load test case function
function loadTestCase(filename) {
    fetch(filename)
        .then(response => response.json())
        .then(data => {
            const app = new PolynomialInterpolation();
            app.processPolynomial(data).then(result => {
                app.displayResults(result);
            }).catch(error => {
                app.displayMessage('Error: ' + error.message, 'error');
            });
        })
        .catch(error => {
            console.error('Error loading test case:', error);
            alert('Error loading test case: ' + error.message);
        });
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PolynomialInterpolation();
}); 