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
}

class ConversorApp {
    constructor() {
        this.api = new ConversorAPI('https://conversor-sistemas-numericos-production.up.railway.app');
        this.fromSystem = 'bin';
        this.toSystem = 'hex';
        this.fromBase = 2;
        this.toBase = 16;
        
        this.elements = {
            fromBtns: document.querySelectorAll('.from-section .system-btn'),
            toBtns: document.querySelectorAll('.to-section .system-btn'),
            numberInput: document.getElementById('numberInput'),
            fromPrefix: document.getElementById('fromPrefix'),
            toPrefix: document.getElementById('toPrefix'),
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
            errorMessage: document.getElementById('errorMessage')
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
            this.elements.toPrefix.textContent = '?';
        } else {
            this.elements.customToGroup.classList.add('hidden');
            this.toBase = SYSTEMS[this.toSystem].base;
            this.elements.toPrefix.textContent = SYSTEMS[this.toSystem].prefix;
        }
    }

    updateHint() {
        if (this.fromSystem === 'custom') {
            const base = parseInt(this.elements.customFromBase.value) || 2;
            this.elements.inputHint.textContent = `Dígitos: 0-${this.getMaxDigit(base - 1)}`;
            this.elements.numberInput.placeholder = 'XYZ';
        } else {
            const system = SYSTEMS[this.fromSystem];
            this.elements.fromPrefix.textContent = system.prefix;
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
            this.elements.toPrefix.textContent = '?';
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
        } catch (error) {
            this.showError(error.message || 'Error al conectar con el servidor');
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
});

const style = document.createElement('style');
style.textContent = `
    @keyframes pop {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);
