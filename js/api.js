const ApiService = {
    async generateInterviewQuestion(interviewType, role) {
        const prompt = `
Generate exactly 20 interview questions for a ${role}.

Interview Type: ${interviewType}

Rules:
- If Interview Type is Technical, generate only technical questions.
- If Interview Type is HR, generate only HR and behavioral questions.
- If Interview Type is Mock, generate a mix of technical and HR questions.
- If Interview Type is Managerial, generate leadership and scenario-based questions.
- Return only the questions.
- Number them from 1 to 20.
`;

        return this.queryGemini(prompt);
    },

    async evaluateResponse(question, answer) {
        const prompt = `
Analyze the candidate's answer against the interview question.

Question:
"${question}"

Answer:
"${answer}"

Format your response exactly like this:

SCORE: [0-100]

FEEDBACK:
[Give a short, actionable assessment explaining strengths and areas for improvement.]
`;

        return this.queryGemini(prompt);
    },

    async queryGemini(promptString) {
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptString
                                }
                            ]
                        }
                    ]
                })
            });

            const payload = await response.json();

            if (payload.error) {
                return `API Error: ${payload.error.message}`;
            }

            if (
                payload.candidates &&
                payload.candidates[0] &&
                payload.candidates[0].content &&
                payload.candidates[0].content.parts &&
                payload.candidates[0].content.parts[0]
            ) {
                return payload.candidates[0].content.parts[0].text;
            }

            return "Error: Could not read AI response.";

        } catch (err) {
            console.error("API Connection Error:", err);
            return `Network Error: ${err.message}`;
        }
    }
};