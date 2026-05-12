const SYSTEMS = {
    bin: { base: 2, prefix: '0b', hint: 'Solo 0 y 1', placeholder: '1010' },
    oct: { base: 8, prefix: '0o', hint: 'Solo 0 al 7', placeholder: '377' },
    dec: { base: 10, prefix: '', hint: 'Dígitos del 0 al 9', placeholder: '255' },
    hex: { base: 16, prefix: '0x', hint: '0-9 y A-F', placeholder: 'FF' },
    custom: { base: null, prefix: '?', hint: 'Base personalizada', placeholder: 'XYZ' }
};

const BASE_NAMES = {
    2: 'Binario',
    8: 'Octal',
    10: 'Decimal',
    16: 'Hexadecimal'
};

class ConversorAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async convertir(numero, baseIn, baseOut) {
        const response = await fetch(`${this.baseUrl}/convertir`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                numero: numero.toUpperCase(),
                base_in: baseIn,
                base_out: baseOut
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Error en la conversión');
        }

        const data = await response.json();
        return data.resultado;
    }

    async sumaBinaria(bin1, bin2) {
        const response = await fetch(`${this.baseUrl}/suma-binaria`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bin1: bin1,
                bin2: bin2
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Error en la suma binaria');
        }

        return await response.json();
    }
}

class ConversorApp {
    constructor() {
        this.api = new ConversorAPI('https://conversor-sistemas-numericos-production.up.railway.app');
        this.api = new ConversorAPI('http://127.0.0.1:8000');
        this.fromSystem = 'bin';
        this.toSystem = 'hex';
        this.fromBase = 2;
        this.toBase = 16;

        this.elements = {
            fromBtns: document.querySelectorAll('.from-section .system-btn'),
            toBtns: document.querySelectorAll('.to-section .system-btn'),
            numberInput: document.getElementById('numberInput'),
            inputHint: document.getElementById('inputHint'),
            resultValue: document.getElementById('resultValue'),
            swapBtn: document.getElementById('swapBtn'),
            convertBtn: document.getElementById('convertBtn'),
            outputWrapper: document.querySelector('.output-wrapper'),
            customFromGroup: document.getElementById('customFromGroup'),
            customToGroup: document.getElementById('customToGroup'),
            customFromBase: document.getElementById('customFromBase'),
            customToBase: document.getElementById('customToBase'),
            errorSection: document.getElementById('errorSection'),
            errorMessage: document.getElementById('errorMessage'),
            errorMessage: document.getElementById('errorMessage'),
            procedimientoSection: document.getElementById('procedimientoSection'),
            procCarreos: document.getElementById('procCarreos'),
            procN1: document.getElementById('procN1'),
            procN2: document.getElementById('procN2'),
            procRes: document.getElementById('procRes')
        };

        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        this.elements.fromBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectFromSystem(btn));
        });

        this.elements.toBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectToSystem(btn));
        });

        this.elements.customFromBase.addEventListener('input', () => {
            this.fromBase = parseInt(this.elements.customFromBase.value) || 2;
            this.updateHint();
        });

        this.elements.customToBase.addEventListener('input', () => {
            this.toBase = parseInt(this.elements.customToBase.value) || 16;
        });

        this.elements.numberInput.addEventListener('input', () => {
            this.hideError();
        });

        this.elements.numberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.convert();
        });

        this.elements.swapBtn.addEventListener('click', () => this.swap());
        this.elements.convertBtn.addEventListener('click', () => this.convert());
        this.elements.outputWrapper.addEventListener('click', () => this.copyResult());
    }

    selectFromSystem(btn) {
        this.elements.fromBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.fromSystem = btn.dataset.system;

        if (this.fromSystem === 'custom') {
            this.elements.customFromGroup.classList.remove('hidden');
            this.fromBase = parseInt(this.elements.customFromBase.value) || 2;
        } else {
            this.elements.customFromGroup.classList.add('hidden');
            this.fromBase = SYSTEMS[this.fromSystem].base;
        }

        this.updateHint();
    }

    selectToSystem(btn) {
        this.elements.toBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.toSystem = btn.dataset.system;

        if (this.toSystem === 'custom') {
            this.elements.customToGroup.classList.remove('hidden');
            this.toBase = parseInt(this.elements.customToBase.value) || 16;
        } else {
            this.elements.customToGroup.classList.add('hidden');
            this.toBase = SYSTEMS[this.toSystem].base;
        }
    }

    updateHint() {
        if (this.fromSystem === 'custom') {
            const base = parseInt(this.elements.customFromBase.value) || 2;
            this.elements.inputHint.textContent = `Dígitos: 0-${this.getMaxDigit(base - 1)}`;
            this.elements.numberInput.placeholder = 'XYZ';
        } else {
            const system = SYSTEMS[this.fromSystem];
            this.elements.numberInput.placeholder = system.placeholder;
            this.elements.inputHint.textContent = system.hint;
        }
    }

    getMaxDigit(base) {
        const digits = '0123456789ABCDEF';
        return digits[base] || base;
    }

    updateUI() {
        this.updateHint();
        this.elements.resultValue.textContent = '—';
    }

    swap() {
        const tempSystem = this.fromSystem;
        const tempBase = this.fromBase;

        this.fromSystem = this.toSystem;
        this.toSystem = tempSystem;

        this.fromBase = this.toBase;
        this.toBase = tempBase;

        this.elements.fromBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.system === this.fromSystem);
        });

        this.elements.toBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.system === this.toSystem);
        });

        if (this.fromSystem === 'custom') {
            this.elements.customFromGroup.classList.remove('hidden');
            this.elements.customFromBase.value = this.fromBase;
        } else {
            this.elements.customFromGroup.classList.add('hidden');
        }

        if (this.toSystem === 'custom') {
            this.elements.customToGroup.classList.remove('hidden');
            this.elements.customToBase.value = this.toBase;
        } else {
            this.elements.customToGroup.classList.add('hidden');
        }

        const inputValue = this.elements.numberInput.value;
        this.elements.numberInput.value = this.elements.resultValue.textContent !== '—' 
            ? this.elements.resultValue.textContent : '';

        this.updateUI();
    }

    showLoading() {
        this.elements.convertBtn.disabled = true;
        this.elements.convertBtn.querySelector('.btn-text').classList.add('hidden');
        this.elements.convertBtn.querySelector('.btn-loader').classList.remove('hidden');
    }

    hideLoading() {
        this.elements.convertBtn.disabled = false;
        this.elements.convertBtn.querySelector('.btn-text').classList.remove('hidden');
        this.elements.convertBtn.querySelector('.btn-loader').classList.add('hidden');
    }

    hideError() {
        this.elements.errorSection.classList.add('hidden');
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorSection.classList.remove('hidden');
    }

    hideProcedimiento() {
        this.elements.procedimientoSection.classList.add('hidden');
    }

    showProcedimiento(procedimiento) {
        // Obtener la longitud máxima de todos los valores
        const maxLength = Math.max(
            procedimiento.carreos.length,
            procedimiento.n1.length,
            procedimiento.n2.length,
            procedimiento.res.length
        );

        // Alinear todos los valores a la derecha con padStart
        const carreosPadded = procedimiento.carreos.padStart(maxLength);
        const n1Padded = procedimiento.n1.padStart(maxLength);
        const n2Padded = procedimiento.n2.padStart(maxLength);
        const resPadded = procedimiento.res.padStart(maxLength);

        this.elements.procCarreos.textContent = carreosPadded;
        this.elements.procN1.textContent = n1Padded;
        this.elements.procN2.textContent = n2Padded;
        this.elements.procRes.textContent = resPadded;
        this.elements.procedimientoSection.classList.remove('hidden');
    }

    validateInput(numero, base) {
        const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
        const regex = new RegExp(`^[${validChars}]+$`);
        return regex.test(numero.toUpperCase());
    }

    async convert() {
        const numero = this.elements.numberInput.value.trim();

        if (!numero) {
            this.showError('Ingresa un número para convertir');
            return;
        }

        if (!this.validateInput(numero, this.fromBase)) {
            const baseName = BASE_NAMES[this.fromBase] || `base ${this.fromBase}`;
            this.showError(`Número inválido para ${baseName}`);
            return;
        }

        if (this.fromBase === this.toBase) {
            this.elements.resultValue.textContent = numero.toUpperCase();
            this.hideProcedimiento();
            return;
        }

        this.hideError();
        this.showLoading();

        try {
            const resultado = await this.api.convertir(numero, this.fromBase, this.toBase);
            this.elements.resultValue.textContent = resultado;
            this.elements.resultValue.style.animation = 'none';
            this.elements.resultValue.offsetHeight;
            this.elements.resultValue.style.animation = 'pop 0.3s ease';
            
            // Si es suma binaria (binario a binario), mostrar procedimiento
            if (this.fromBase === 2 && this.toBase === 2) {
                try {
                    const procedimiento = await this.api.sumaBinaria(numero, '0');
                    this.showProcedimiento(procedimiento);
                } catch (e) {
                    console.log('No se pudo obtener el procedimiento:', e);
                    this.hideProcedimiento();
                }
            } else {
                this.hideProcedimiento();
            }
        } catch (error) {
            this.showError(error.message || 'Error al conectar con el servidor');
            this.hideProcedimiento();
        } finally {
            this.hideLoading();
        }
    }

    async copyResult() {
        const result = this.elements.resultValue.textContent;
        if (!result || result === '—') return;

        try {
            await navigator.clipboard.writeText(result);
            this.elements.outputWrapper.classList.add('copied');
            this.elements.resultValue.textContent = '✓';

            setTimeout(() => {
                this.elements.resultValue.textContent = result;
                this.elements.outputWrapper.classList.remove('copied');
            }, 1000);
        } catch (err) {
            this.showError('No se pudo copiar al portapapeles');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ConversorApp();
    new CalculadoraBinariaApp();
});

class CalculadoraBinariaApp {
    constructor() {
        this.api = new ConversorAPI('http://127.0.0.1:8000');

        this.elements = {
            binNum1: document.getElementById('binNum1'),
            binNum2: document.getElementById('binNum2'),
            calcBtn: document.getElementById('calcBtn'),
            calcResult: document.getElementById('calcResult'),
            calcResultValue: document.getElementById('calcResultValue'),
            calcErrorSection: document.getElementById('calcErrorSection'),
            calcErrorMessage: document.getElementById('calcErrorMessage'),
            calcProcedimientoSection: document.getElementById('calcProcedimientoSection'),
            calcProcCarreos: document.getElementById('calcProcCarreos'),
            calcProcN1: document.getElementById('calcProcN1'),
            calcProcN2: document.getElementById('calcProcN2'),
            calcProcRes: document.getElementById('calcProcRes')
        };

        this.bindEvents();
    }

    bindEvents() {
        this.elements.calcBtn.addEventListener('click', () => this.calcular());
        this.elements.binNum1.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calcular();
        });
        this.elements.binNum2.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.calcular();
        });
        this.elements.calcResultValue.addEventListener('click', () => this.copiarResultado());
        [this.elements.binNum1, this.elements.binNum2].forEach(input => {
            input.addEventListener('input', () => this.hideError());
        });
    }

    hideError() {
        this.elements.calcErrorSection.classList.add('hidden');
    }

    showError(message) {
        this.elements.calcErrorMessage.textContent = message;
        this.elements.calcErrorSection.classList.remove('hidden');
    }

    hideResult() {
        this.elements.calcResult.classList.add('hidden');
    }

    showResult(resultado) {
        this.elements.calcResultValue.textContent = resultado;
        this.elements.calcResult.classList.remove('hidden');
        this.elements.calcResultValue.style.animation = 'none';
        this.elements.calcResultValue.offsetHeight;
        this.elements.calcResultValue.style.animation = 'pop 0.3s ease';
    }

    hideProcedimiento() {
        this.elements.calcProcedimientoSection.classList.add('hidden');
    }

    showProcedimiento(procedimiento) {
        // Obtener la longitud máxima de todos los valores
        const maxLength = Math.max(
            procedimiento.carreos.length,
            procedimiento.n1.length,
            procedimiento.n2.length,
            procedimiento.res.length
        );

        // Alinear todos los valores a la derecha con padStart
        const carreosPadded = procedimiento.carreos.padStart(maxLength);
        const n1Padded = procedimiento.n1.padStart(maxLength);
        const n2Padded = procedimiento.n2.padStart(maxLength);
        const resPadded = procedimiento.res.padStart(maxLength);

        this.elements.calcProcCarreos.textContent = carreosPadded;
        this.elements.calcProcN1.textContent = n1Padded;
        this.elements.calcProcN2.textContent = n2Padded;
        this.elements.calcProcRes.textContent = resPadded;
        this.elements.calcProcedimientoSection.classList.remove('hidden');
    }

    showLoading() {
        this.elements.calcBtn.disabled = true;
        this.elements.calcBtn.querySelector('.btn-text').classList.add('hidden');
        this.elements.calcBtn.querySelector('.btn-loader').classList.remove('hidden');
    }

    hideLoading() {
        this.elements.calcBtn.disabled = false;
        this.elements.calcBtn.querySelector('.btn-text').classList.remove('hidden');
        this.elements.calcBtn.querySelector('.btn-loader').classList.add('hidden');
    }

    validarBinario(valor) {
        return /^[01]+$/.test(valor);
    }

    async calcular() {
        const bin1 = this.elements.binNum1.value.trim();
        const bin2 = this.elements.binNum2.value.trim();

        if (!bin1 || !bin2) {
            this.showError('Ingresa ambos números binarios');
            return;
        }

        if (!this.validarBinario(bin1) || !this.validarBinario(bin2)) {
            this.showError('Los números deben contener solo 0 y 1');
            return;
        }

        this.hideError();
        this.showLoading();

        try {
            const resultado = await this.api.sumaBinaria(bin1, bin2);
            this.showResult(resultado.resultado);
            this.showProcedimiento(resultado);
        } catch (error) {
            this.showError(error.message || 'Error al calcular la suma');
            this.hideResult();
            this.hideProcedimiento();
        } finally {
            this.hideLoading();
        }
    }

    async copiarResultado() {
        const result = this.elements.calcResultValue.textContent;
        if (!result || result === '—') return;

        try {
            await navigator.clipboard.writeText(result);
            this.elements.calcResult.classList.add('copied');
            this.elements.calcResultValue.textContent = '✓';

            setTimeout(() => {
                this.elements.calcResultValue.textContent = result;
                this.elements.calcResult.classList.remove('copied');
            }, 1000);
        } catch (err) {
            this.showError('No se pudo copiar al portapapeles');
        }
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes pop {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);
