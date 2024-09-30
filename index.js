class SpeedTyper {
    #timeLeft = 60;         
    #countDownActive = false; 
    #countdown;
    #apiUrl = 'https://api.api-ninjas.com/v1/quotes';      
    #api = "2Ty/vxve41sfRybB+5/brA==rJZticdIoq9PZ4in";      
    
    constructor(inputArea, countDownElement, resultElement,generatedTextElement) {
        this.inputArea = inputArea;       
        this.countDownElement = countDownElement; 
        this.resultElement = resultElement;
        this.generatedTextElement = generatedTextElement;
        this.currentQuote = '';

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
    }

    async getQuote() {
        try{
            const response = await fetch(this.#apiUrl,{
                headers:{
                    'X-Api-Key':this.#api
                }
            });
            const data = await response.json();
            let quote = data[0].quote;
            this.generatedTextElement.innerHTML = this.#quoteToHTML(this.currentQuote); 
        }catch(error){
            console.log(error);
            this.generatedTextElement.textContent = 'Failed to fetch quote.';
        }
    }

    #quoteToHTML(quote){
        return quote.split('').map(char => `<span class = "letter">${char}</span>`).join('');
    }

    #checkInput(){
        const input = this.inputArea.value;
        const quoteChars = this.generatedTextElement.querySelectorAll('.letter');

        quoteChars.forEach((charSpan, index) => {
            if (index < input.length) {
                const typedChar = input[index];
                if (typedChar === charSpan.textContent) {
                    charSpan.classList.add('correct');
                    charSpan.classList.remove('incorrect');
                } else {
                    charSpan.classList.add('incorrect');
                    charSpan.classList.remove('correct');
                }
            } else {
                charSpan.classList.remove('correct', 'incorrect');
            }
        });
    }

    restartTest() {
        clearInterval(this.#countdown);
        this.#timeLeft = 60;
        this.countDownElement.textContent = this.#timeLeft;
        this.inputArea.disabled = true;
        this.inputArea.value = "";
        this.#countDownActive = false;
        this.resultElement.style.display = "none";
        this.generatedTextElement.innerHTML = "";
    }
}

// Init the app
window.onload = function() {
    const inputArea = document.getElementById("inputArea");
    const countDownElement = document.getElementById("countdown");
    const resultElement = document.getElementById("result");
    const generatedTextElement = document.getElementById("generatedText");

    const speedTyper = new SpeedTyper(inputArea, countDownElement, resultElement, generatedTextElement);

    document.querySelector("button").addEventListener("click", () => speedTyper.restartTest());
};

