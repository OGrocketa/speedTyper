class SpeedTyper {
    #timeLeft = 15;         
    #countDownActive = false; 
    #countdown;
    #apiUrl = 'https://api.api-ninjas.com/v1/quotes';      
    #api = ""; 
    #startTime = null;
    #wpmCounter = 0;
    #wpmInterval;
    #correctChars = 0;
    #totalCharsTyped = 0;

    
    constructor(inputArea, countDownElement, resultElement,generatedTextElement,mistakesStat,wpmElement) {
        this.inputArea = inputArea;       
        this.countDownElement = countDownElement; 
        this.resultElement = resultElement;
        this.generatedTextElement = generatedTextElement;
        this.quote = '';
        this.mistakesStat = mistakesStat;
        this.wpmElement = wpmElement; 

        this.#setupEventListeners();
    }

    #setupEventListeners() {
        document.addEventListener('keydown', (e) => this.#handleKeydown(e));
        this.inputArea.addEventListener('input', () => {
            this.#checkInput();
        });
    }

    #startWPMInterval() {
        this.#wpmInterval = setInterval(() => {
            this.#updateWPM();
        }, 5000);  // WPM updates every 5 seconds
    }

    #updateWPM(){
        const now = new Date();
        const elapsedTime = (now - this.#startTime)/1000;

        const typedWords = this.inputArea.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        const wpm = Math.floor((typedWords / elapsedTime) * 60);

        if(elapsedTime > 0) this.wpmElement.textContent = wpm;
        this.#wpmCounter = wpm;

    }

    #handleKeydown(e) {
        if (e.code === 'Space' && !this.#countDownActive) {
            e.preventDefault();
            this.getQuote();
            this.#countDownActive = true;
            this.#startCountdown();
            this.inputArea.disabled  = false;
            this.inputArea.focus();
            this.#startTime = new Date();
            this.#startWPMInterval();
        }
    }

    #startCountdown() {
        this.#countdown = setInterval(() => {
            if (this.#timeLeft < 0) {
                clearInterval(this.#countdown);
                this.inputArea.disabled = true;
                this.#updateWPM();
                this.#displayResult();
                clearInterval(this.#wpmInterval);  
            } else {
                this.countDownElement.textContent = this.#timeLeft;
                this.#timeLeft--;
            }
        }, 1000);
    }

    #displayResult() {
        this.resultElement.style.display = "block";
        const mistakesRes = document.getElementById("finalMistakes");
        const wpmRes = document.getElementById("finalWPM");
        wpmRes.textContent = this.#wpmCounter;

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

    this.#correctChars = 0; 
    this.#totalCharsTyped = input.replace(/\s+/g, '').length;
    let quoteComplete = true; // Flag to check if the entire quote is typed

    // Check each word
    wordSpans.forEach((wordSpan, wordIndex) => {
        const charSpans = wordSpan.querySelectorAll('.letter');
        
        // Only check words that the user has typed
        if (wordIndex < words.length) {
            const typedWord = words[wordIndex];
            const wordText = Array.from(charSpans).map(charSpan => charSpan.textContent).join('');
            
            if (typedWord === wordText) {
                // If the word is correct, mark all characters in the word as correct
                charSpans.forEach(charSpan => {
                    charSpan.classList.add('correct');
                    charSpan.classList.remove('incorrect');
                    this.#correctChars++;
                });
            } else {
                // The word is incorrect, set the quoteComplete flag to false
                quoteComplete = false;

                // Compare each character of the typed word with the correct word
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

                // Count extra characters typed beyond the word length as mistakes
                if (typedWord.length > wordText.length) {
                    const extraCharsCount = typedWord.length - wordText.length;
                }
                
            }
        } else {
            // Ensure the following words are not marked as anything if not typed yet
            charSpans.forEach(charSpan => charSpan.classList.remove('correct', 'incorrect'));
        }
    });
    
    // Only allow typing up to the current word
    if (words.length > wordSpans.length || words[words.length - 1] !== Array.from(wordSpans[words.length - 1].querySelectorAll('.letter')).map(char => char.textContent).join('')) {
        this.inputArea.value = words.slice(0, wordSpans.length).join(' ');  // Restrict further typing until the current word is correct
    }

    // If the entire quote is complete and correct, fetch a new quote and replace the current one
    if (quoteComplete && this.inputArea.value === this.quote) {
        this.getAndReplaceQuote();  // Fetch and replace the current quote
    }
}

    
    async getAndReplaceQuote(){
        try{
            const response = await fetch(this.#apiUrl,{
                headers:{
                    'X-Api-Key': this.#api
                }
            });
            const data = await response.json();
            this.quote = data[0].quote;  // Replace the current quote
            
            // Replace the HTML content with the new quote
            this.generatedTextElement.innerHTML = this.#quoteToHTML(this.quote);

            // Clear the input field so the user can start typing the new quote
            this.inputArea.value = "";
        }catch(error){
            console.log(error);
            this.generatedTextElement.textContent = 'Failed to fetch new quote.';
        }
    }



    restartTest() {
        clearInterval(this.#countdown);
        clearInterval(this.#wpmInterval);
        this.#timeLeft = 15;
        this.countDownElement.textContent = this.#timeLeft;
        this.inputArea.disabled = true;
        this.inputArea.value = "";
        this.#countDownActive = false;
        this.resultElement.style.display = "none";
        this.generatedTextElement.innerHTML = "";
        this.#wpmCounter = 0;
        this.wpmElement.textContent = this.#wpmCounter;
    }
}

// Init the app
window.onload = function() {
    const inputArea = document.getElementById("inputArea");
    const countDownElement = document.getElementById("countdown");
    const resultElement = document.getElementById("result");
    const generatedTextElement = document.getElementById("generatedText");
    const mistakesStat = document.getElementById("mistakesCounter");
    const wpmElement = document.getElementById("wpmCounter");
    const speedTyper = new SpeedTyper(inputArea, countDownElement, resultElement, generatedTextElement,mistakesStat,wpmElement);

    document.querySelector("button").addEventListener("click", () => speedTyper.restartTest());
};

