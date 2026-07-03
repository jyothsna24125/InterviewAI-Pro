const MediaEngine = {
    stream: null,
    recognition: null,

    // Request and attach webcam video
    async startCamera(videoElement) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            videoElement.srcObject = this.stream;
        } catch (error) {
            console.error("Camera permissions denied:", error);
            alert("Please allow camera permissions to experience simulation proctoring.");
        }
    },

    // Stop active webcam feed
    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    },

    // Initialize native browser speech-to-text loop
    initSpeechRecognition(onResultCallback) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition is not supported in this browser.");
            return null;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = CONFIG.DEFAULT_LANGUAGE;

        this.recognition.onresult = (event) => {
            const currentResultIndex = event.resultIndex;
            const transcript = event.results[currentResultIndex][0].transcript;
            onResultCallback(transcript);
        };

        return this.recognition;
    }
};