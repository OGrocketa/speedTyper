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
        return quote.split(' ').map(word => {
            return `<span class="word">${word.split('').map(char => `<span class="letter">${char}</span>`).join('')}</span>`;
        }).join(' ');
    }
    
    #checkInput() {
        const input = this.inputArea.value.trim();
        const words = input.split(' '); // Get typed words
        const wordSpans = this.generatedTextElement.querySelectorAll('.word'); // Get words in the quote
    
        // Check each word
        wordSpans.forEach((wordSpan, wordIndex) => {
            const charSpans = wordSpan.querySelectorAll('.letter');
            
            //Only check words which user typed
            if (wordIndex < words.length) {
                const typedWord = words[wordIndex];
                const wordText = Array.from(charSpans).map(charSpan => charSpan.textContent).join('');
                
                if (typedWord === wordText) {
                    // If the word is correct, mark all characters in the word as correct
                    charSpans.forEach(charSpan => {
                        charSpan.classList.add('correct');
                        charSpan.classList.remove('incorrect');
                    });
                } else {
                    // If the word is incorrect, force correction and prevent moving forward
                    charSpans.forEach((charSpan, charIndex) => {
                        if (charIndex < typedWord.length) {
                            const typedChar = typedWord[charIndex];
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
            } else {
                // Ensure the following words are not marked as anything (if not typed yet)
                charSpans.forEach(charSpan => charSpan.classList.remove('correct', 'incorrect'));
            }
        });
        
        // Only allow typing up to the current word
        if (words.length > wordSpans.length || words[words.length - 1] !== Array.from(wordSpans[words.length - 1].querySelectorAll('.letter')).map(char => char.textContent).join('')) {
            this.inputArea.value = words.slice(0, wordSpans.length).join(' ');  // Restrict further typing until current word is correct
        }
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

