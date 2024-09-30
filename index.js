class SpeedTyper {
    #timeLeft = 15;         
    #countDownActive = false; 
    #countdown;
    #apiUrl = 'https://api.api-ninjas.com/v1/quotes';      
    #api = "2Ty/vxve41sfRybB+5/brA==rJZticdIoq9PZ4in";
    #mistakes = 0;   
    
    constructor(inputArea, countDownElement, resultElement,generatedTextElement,mistakesStat) {
        this.inputArea = inputArea;       
        this.countDownElement = countDownElement; 
        this.resultElement = resultElement;
        this.generatedTextElement = generatedTextElement;
        this.quote = '';
        this.mistakesStat = mistakesStat;

        this.#setupEventListeners();
    }

    #setupEventListeners() {
        document.addEventListener('keydown', (e) => this.#handleKeydown(e));
        this.inputArea.addEventListener('input', () => this.#checkInput());
    }

    #handleKeydown(e) {
        if (e.code === 'Space' && !this.#countDownActive) {
            e.preventDefault();
            this.getQuote();
            this.#countDownActive = true;
            this.#startCountdown();
            this.inputArea.disabled  = false;
            this.inputArea.focus();
        }
    }

    #startCountdown() {
        this.#countdown = setInterval(() => {
            if (this.#timeLeft < 0) {
                clearInterval(this.#countdown);
                this.inputArea.disabled = true;
                this.#displayResult();
            } else {
                this.countDownElement.textContent = this.#timeLeft;
                this.#timeLeft--;
            }
        }, 1000);
    }

    #displayResult() {
        this.resultElement.style.display = "block";
        const mistakesRes = document.getElementById("finalMistakes");
        mistakesRes.textContent = this.#mistakes;
    }

    async getQuote() {
        try{
            const response = await fetch(this.#apiUrl,{
                headers:{
                    'X-Api-Key':this.#api
                }
            });
            const data = await response.json();
            this.quote = data[0].quote;  
            this.generatedTextElement.innerHTML = this.#quoteToHTML(this.quote); 
        }catch(error){
            console.log(error);
            this.generatedTextElement.textContent = 'Failed to fetch quote.';
        }
    }

    #quoteToHTML(quote) {
        return quote.split('').map(char => {
            if (char === ' ') {
                return `<span class="letter space">&nbsp;</span>`;
            } else if (char === ',') {
                return `<span class="letter comma">,</span>`;
            }
            return `<span class="letter">${char}</span>`;
        }).join('');
    }

    #checkInput() {
        const input = this.inputArea.value;
        const quoteChars = this.generatedTextElement.querySelectorAll('.letter');
        
        quoteChars.forEach((charSpan, index) => {
            if (index < input.length && index < quoteChars.length) {  // Ensure no overflow
                const typedChar = input[index];
    
                // Special handling for spaces
                if (charSpan.textContent === '\u00A0') {  // Unicode for non-breaking space
                    if (typedChar === ' ') {
                        charSpan.classList.add('correct');
                        charSpan.classList.remove('incorrect', 'mistake-counted');
                    } else if (!charSpan.classList.contains('mistake-counted')) {
                        this.#mistakes++;
                        this.mistakesStat.textContent = this.#mistakes;
                        charSpan.classList.add('incorrect', 'mistake-counted');
                        charSpan.classList.remove('correct');
                    }
                } else {
                    // Handle regular characters
                    if (typedChar === charSpan.textContent) {
                        charSpan.classList.add('correct');
                        charSpan.classList.remove('incorrect', 'mistake-counted');
                    } else if (!charSpan.classList.contains('mistake-counted')) {
                        this.#mistakes++;
                        this.mistakesStat.textContent = this.#mistakes;
                        charSpan.classList.add('incorrect', 'mistake-counted');
                        charSpan.classList.remove('correct');
                    }
                }
            } else {
                charSpan.classList.remove('correct', 'incorrect', 'mistake-counted');
            }
        });
    }
    
    

    restartTest() {
        clearInterval(this.#countdown);
        this.#timeLeft = 15;
        this.countDownElement.textContent = this.#timeLeft;
        this.inputArea.disabled = true;
        this.inputArea.value = "";
        this.#countDownActive = false;
        this.resultElement.style.display = "none";
        this.generatedTextElement.innerHTML = "";
        this.#mistakes = 0;
    }
}

// Init the app
window.onload = function() {
    const inputArea = document.getElementById("inputArea");
    const countDownElement = document.getElementById("countdown");
    const resultElement = document.getElementById("result");
    const generatedTextElement = document.getElementById("generatedText");
    const mistakesStat = document.getElementById("mistakesCounter");
    const speedTyper = new SpeedTyper(inputArea, countDownElement, resultElement, generatedTextElement,mistakesStat);

    document.querySelector("button").addEventListener("click", () => speedTyper.restartTest());
};

