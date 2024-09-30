class SpeedTyper {
    #timeLeft = 2;         
    #countDownActive = false; 
    #countdown;
    #apiUrl = 'https://api.api-ninjas.com/v1/quotes';      
    #api = "2Ty/vxve41sfRybB+5/brA==rJZticdIoq9PZ4in";      
    
    constructor(inputArea, countDownElement, resultElement,generatedTextElement) {
        this.inputArea = inputArea;       
        this.countDownElement = countDownElement; 
        this.resultElement = resultElement;
        this.generatedTextElement = generatedTextElement;


        this.#setupEventListeners();
    }

    #setupEventListeners() {
        document.addEventListener('keydown', (e) => this.#handleKeydown(e));
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
            this.generatedTextElement.textContent = quote;
        }catch(error){
            console.log(error);
            this.generatedTextElement.textContent = 'Failed to fetch quote.';
        }
    }


    restartTest() {
        clearInterval(this.#countdown);
        this.#timeLeft = 2;
        this.countDownElement.textContent = this.#timeLeft;
        this.inputArea.disabled = true;
        this.inputArea.value = "";
        this.#countDownActive = false;
        this.resultElement.style.display = "none";
        this.generatedTextElement.textContent = "";
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

