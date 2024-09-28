class SpeedTyper {
    #timeLeft = 2;         
    #countDownActive = false; 
    #countdown;             
    
    constructor(inputArea, countDownElement, resultElement) {
        this.inputArea = inputArea;       
        this.countDownElement = countDownElement; 
        this.resultElement = resultElement;

        this.#setupEventListeners();
    }

    #setupEventListeners() {
        document.addEventListener('keydown', (e) => this.#handleKeydown(e));
    }

    #handleKeydown(e) {
        if (e.code === 'Space' && !this.#countDownActive) {
            e.preventDefault();
            this.#countDownActive = true;
            this.#startCountdown();
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


    restartTest() {
        clearInterval(this.#countdown);
        this.#timeLeft = 2;
        this.countDownElement.textContent = this.#timeLeft;
        this.inputArea.disabled = false;
        this.inputArea.value = "";
        this.#countDownActive = false;
        this.resultElement.style.display = "none";
    }
}

// Init the app
window.onload = function() {
    const inputArea = document.getElementById("inputArea");
    const countDownElement = document.getElementById("countdown");
    const resultElement = document.getElementById("result");

    const speedTyper = new SpeedTyper(inputArea, countDownElement, resultElement);

    document.querySelector("button").addEventListener("click", () => speedTyper.restartTest());
};
