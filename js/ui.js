const UIEngine = {
    timerInterval: null,

    // Switch between screens using our utility hidden utility class
    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    },

    // Handle countdown timer operations
    startTimer(displayElement, totalSeconds, onTimeUpCallback) {
        clearInterval(this.timerInterval);
        let timeRemaining = totalSeconds;

        const updateDisplay = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            displayElement.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        updateDisplay();

        this.timerInterval = setInterval(() => {
            timeRemaining--;
            updateDisplay();

            if (timeRemaining <= 0) {
                clearInterval(this.timerInterval);
                onTimeUpCallback();
            }
        }, 1000);
    },

    stopTimer() {
        clearInterval(this.timerInterval);
    },

    // Extract Score and Feedback from the raw text layout response payload from Gemini
    renderEvaluationResults(rawTextResponse, scoreSelector, feedbackSelector) {
        let score = "70"; // Fallback placeholder
        let feedback = rawTextResponse;

        try {
            if (rawTextResponse.includes("SCORE:") && rawTextResponse.includes("FEEDBACK:")) {
                const scorePart = rawTextResponse.split("SCORE:")[1].split("FEEDBACK:")[0].trim();
                feedback = rawTextResponse.split("FEEDBACK:")[1].trim();
                // Clean non-numeric characters away if model wrapped it in markdown brackets
                score = scorePart.replace(/[^0-9]/g, ''); 
            }
        } catch (e) {
            console.warn("Could not perfectly match structural prompt extraction regex:", e);
        }

        document.getElementById(scoreSelector).innerText = `${score}/100`;
        document.getElementById(feedbackSelector).innerText = feedback;
    }
};