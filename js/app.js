// Local application tracking state
const AppState = {
    questions: [],
    currentQuestionIndex: 0,
    isListening: false,
    speechRecognitionInstance: null
};

// Initialize listeners on DOM window content mount execution
document.addEventListener("DOMContentLoaded", () => {
    const startInterviewBtn = document.getElementById("startInterviewBtn");
    const submitAnswerBtn = document.getElementById("submitAnswerBtn");
    const toggleVoiceBtn = document.getElementById("toggleVoiceBtn");
    const restartBtn = document.getElementById("restartBtn");

    const webcamPreview = document.getElementById("webcamPreview");
    const questionContent = document.getElementById("questionContent");
    const timeCounter = document.getElementById("timeCounter");
    const userTextResponse = document.getElementById("userTextResponse");

    // --- Action: Start Interview Session Flow ---
    startInterviewBtn.addEventListener("click", async () => {
        const selectedRole = document.getElementById("jobRole").value;
        const interviewType = document.getElementById("interviewType").value;
        localStorage.setItem("selectedRole", selectedRole);
localStorage.setItem("interviewType", interviewType);
        
        // 1. Move to workspace setup
        UIEngine.switchScreen("interviewScreen");
        questionContent.innerText = "Connecting to AI Recruiter and analyzing requirements...";
        userTextResponse.value = "";

        // 2. Provision media streams
        await MediaEngine.startCamera(webcamPreview);

        // 3. Request target text payload prompt question
        const question = await ApiService.generateInterviewQuestion(interviewType, selectedRole);

AppState.questions = question.split("\n").filter(q => q.trim() !== "");
AppState.currentQuestionIndex = 0;

questionContent.innerText = AppState.questions[0];

        // 4. Fire target expiration timing counter loop
        UIEngine.startTimer(timeCounter, CONFIG.ROUND_TIMER_SECONDS, () => {
            alert("Time is up! Submitting your current input automatically.");
            submitAnswerBtn.click();
        });
    });

    // --- Action: Voice Speech-to-Text Toggle Mechanism ---
    AppState.speechRecognitionInstance = MediaEngine.initSpeechRecognition((transcriptText) => {
        userTextResponse.value += (userTextResponse.value ? " " : "") + transcriptText;
    });

    toggleVoiceBtn.addEventListener("click", () => {
        if (!AppState.speechRecognitionInstance) {
            alert("Speech recognition profile is not supported or active on this browser viewport framework.");
            return;
        }

        if (!AppState.isListening) {
            AppState.speechRecognitionInstance.start();
            AppState.isListening = true;
            toggleVoiceBtn.innerText = "🛑 Stop Voice Input";
            toggleVoiceBtn.style.background = "var(--accent-red)";
        } else {
            AppState.speechRecognitionInstance.stop();
            AppState.isListening = false;
            toggleVoiceBtn.innerText = "🎤 Start Voice Input";
            toggleVoiceBtn.style.background = "var(--text-secondary)";
        }
    });

    // --- Action: Submit Answer Response for Analysis ---
    submitAnswerBtn.addEventListener("click", async () => {
        // Kill listener routines and video pipes early
        if (AppState.isListening) toggleVoiceBtn.click();

        const candidateAnswer = userTextResponse.value.trim() || "No answer provided by the candidate within the allotted time matrix framework.";
        
        // 1. Move to the next question index (assuming you have an index tracker in AppState)
AppState.currentQuestionIndex++; 

// 2. Check if there are still questions left
if (AppState.currentQuestionIndex < AppState.questions.length) {
    
    
    // Update your UI text element with the new question text
    questionContent.innerText = AppState.questions[AppState.currentQuestionIndex]; 
    
    // Reset the input field for the next answer
    userTextResponse.value = ""; 
    
    // Restart your recording/timing routines here if needed
    // MediaEngine.startCamera(); 
    // UIEngine.startTimer();

} else {
    // 3. ONLY switch to the results screen when ALL questions are finished
    const rawEvaluation = await ApiService.evaluateResponse(
    ApiService.evaluateResponse(
    AppState.questions[AppState.currentQuestionIndex - 1],
    candidateAnswer
    )
);
console.log(rawEvaluation);

let total = Number(localStorage.getItem("totalInterviews")) || 0;
total++;
localStorage.setItem("totalInterviews", total);

const match = rawEvaluation.match(/SCORE:\s*(\d+)/i);
const score = match ? Number(match[1]) : 0;

const interview = {
    type: localStorage.getItem("interviewType"),
    role: localStorage.getItem("selectedRole"),
    score: score,
    feedback: rawEvaluation,
    date: new Date().toLocaleDateString()
};

let history = JSON.parse(localStorage.getItem("history")) || [];
history.unshift(interview);

if (history.length > 10) {
    history.pop();
}
localStorage.setItem("history", JSON.stringify(history));
localStorage.setItem("latestScore", score);
localStorage.setItem("latestFeedback", rawEvaluation);

window.location.href = "dashboard.html";
};
    });

    // --- Action: Reset Application Frame ---
    restartBtn.addEventListener("click", () => {
        UIEngine.switchScreen("setupScreen");
    });
});