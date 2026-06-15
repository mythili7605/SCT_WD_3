const questions = [
    {
        question: "What does HTML stand for?",
        answers: [
            {text: "Hyper Text Markup Language", correct: true},
            {text: "High Text Machine Language", correct: false},
            {text: "Hyper Transfer Markup Language", correct: false},
            {text: "Home Tool Markup Language", correct: false}
        ]
    },
    {
        question: "Which language is used for styling web pages?",
        answers: [
            {text: "HTML", correct: false},
            {text: "CSS", correct: true},
            {text: "Java", correct: false},
            {text: "Python", correct: false}
        ]
    },
    {
        question: "Which language makes websites interactive?",
        answers: [
            {text: "CSS", correct: false},
            {text: "HTML", correct: false},
            {text: "JavaScript", correct: true},
            {text: "SQL", correct: false}
        ]
    },
    {
        question: "Which of the following is NOT a JavaScript framework or library?",
        answers: [
            {text: "React", correct: false},
            {text: "Laravel (PHP)", correct: true},
            {text: "Vue", correct: false},
            {text: "Svelte", correct: false}
        ]
    },
    {
        question: "What does CSS stand for?",
        answers: [
            {text: "Creative Style Sheets", correct: false},
            {text: "Cascading Style Sheets", correct: true},
            {text: "Computer Style Sheets", correct: false},
            {text: "Colorful Style Sheets", correct: false}
        ]
    },
    {
        question: "Which HTTP status code represents 'Internal Server Error'?",
        answers: [
            {text: "404 (Not Found)", correct: false},
            {text: "500 (Internal Error)", correct: true},
            {text: "502 (Bad Gateway)", correct: false},
            {text: "403 (Forbidden)", correct: false}
        ]
    }
];

// DOM elements
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

// Live status elements
const highScoreVal = document.getElementById("high-score-val");
const currentQNum = document.getElementById("current-q-num");
const totalQNum = document.getElementById("total-q-num");
const liveScore = document.getElementById("live-score");
const progressBarFill = document.getElementById("progress-bar-fill");
const timerBarFill = document.getElementById("timer-bar-fill");
const timerText = document.getElementById("timer-text");
const timerSection = document.querySelector(".timer-section");

// Results elements
const resultFeedback = document.getElementById("result-feedback");
const finalScoreText = document.getElementById("final-score-text");
const accuracyText = document.getElementById("accuracy-text");
const avgSpeedText = document.getElementById("avg-speed-text");
const rankBadge = document.getElementById("rank-badge");
const scoreHistory = document.getElementById("score-history");
const clearScoresBtn = document.getElementById("clear-scores-btn");
const restartBtn = document.getElementById("restart-btn");

// State variables
let currentQuestionIndex = 0;
let score = 0;
let highScore = 0;
let timerInterval = null;
const timeLimit = 15; // 15 seconds per question
let timeLeft = 0;
let questionStartTime = 0;
let totalTimeTaken = 0;
let answered = false;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    totalTimeTaken = 0;
    
    // UI resets
    quizScreen.classList.remove("hidden");
    resultScreen.classList.add("hidden");
    nextButton.style.display = "none";
    
    // Load high score
    highScore = parseInt(localStorage.getItem("quiz_high_score")) || 0;
    highScoreVal.textContent = highScore;
    
    showQuestion();
}

function showQuestion() {
    resetState();
    answered = false;
    
    const currentQuestion = questions[currentQuestionIndex];
    questionElement.textContent = currentQuestion.question;
    
    // Set progress info
    currentQNum.textContent = currentQuestionIndex + 1;
    totalQNum.textContent = questions.length;
    liveScore.textContent = score;
    
    // Animate progress bar fill
    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    
    // Generate option buttons
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        
        if (answer.correct) {
            button.dataset.correct = "true";
        }
        
        button.addEventListener("click", selectAnswer);
        answerButtons.appendChild(button);
    });
    
    // Track timestamps & start timer
    questionStartTime = Date.now();
    startTimer();
}

function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
    
    // Clear existing timer interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset timer UI states
    timerSection.classList.remove("timer-warning");
    timerBarFill.style.width = "100%";
    timerText.textContent = `${timeLimit}s`;
}

function startTimer() {
    timeLeft = timeLimit;
    timerText.textContent = `${timeLeft}s`;
    
    // Use a high-frequency interval for smooth progress bar drain (every 100ms)
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        
        // Safety bounds
        if (timeLeft <= 0) {
            timeLeft = 0;
            clearInterval(timerInterval);
            handleTimeOut();
        }
        
        // Update timer UI text
        timerText.textContent = `${Math.ceil(timeLeft)}s`;
        
        // Update timer bar width
        const widthPercent = (timeLeft / timeLimit) * 100;
        timerBarFill.style.width = `${widthPercent}%`;
        
        // Critical countdown warning (under 5 seconds)
        if (timeLeft <= 5) {
            timerSection.classList.add("timer-warning");
        }
    }, 100);
}

function selectAnswer(e) {
    if (answered) return;
    answered = true;
    
    // Stop the timer
    clearInterval(timerInterval);
    
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct === "true";
    
    // Calculate time taken
    const elapsed = (Date.now() - questionStartTime) / 1000;
    totalTimeTaken += Math.min(elapsed, timeLimit);
    
    // Visual feedback on selected option
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
        liveScore.textContent = score;
    } else {
        selectedBtn.classList.add("wrong");
    }
    
    // Reveal correct answer and disable all buttons
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    
    // Update Next button label
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.querySelector("span").textContent = "Finish & See Results";
    } else {
        nextButton.querySelector("span").textContent = "Next Question";
    }
    nextButton.style.display = "flex";
}

function handleTimeOut() {
    if (answered) return;
    answered = true;
    
    // Accumulate maximum limit to total time
    totalTimeTaken += timeLimit;
    
    // Reveal correct answer and mark all options disabled
    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    
    // Update Next button label
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.querySelector("span").textContent = "Finish & See Results";
    } else {
        nextButton.querySelector("span").textContent = "Next Question";
    }
    nextButton.style.display = "flex";
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

function showScore() {
    // Hide active screens, show results screen
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    
    // Final progress bar fills completely
    progressBarFill.style.width = "100%";
    
    // Save to localStorage if it's a new high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("quiz_high_score", highScore);
    }
    
    // Display results stats
    finalScoreText.textContent = `${score} / ${questions.length}`;
    
    const accuracy = Math.round((score / questions.length) * 100);
    accuracyText.textContent = `${accuracy}%`;
    
    const avgSpeed = (totalTimeTaken / questions.length).toFixed(1);
    avgSpeedText.textContent = `${avgSpeed}s`;
    
    // Set Rank Badge and Feedback
    let rank = "Novice";
    let feedback = "Keep practicing, you'll get there!";
    if (accuracy === 100) {
        rank = "Grandmaster";
        feedback = "Flawless victory! You are an expert developer.";
    } else if (accuracy >= 80) {
        rank = "Expert";
        feedback = "Amazing! Your tech skills are outstanding.";
    } else if (accuracy >= 50) {
        rank = "Practitioner";
        feedback = "Well done! You have a solid grasp of web basics.";
    }
    
    rankBadge.textContent = rank;
    resultFeedback.textContent = feedback;
    
    // Save current game score to leaderboard history
    saveScoreToHistory(score, questions.length);
    renderScoreHistory();
}

function saveScoreToHistory(scoreVal, totalVal) {
    const history = JSON.parse(localStorage.getItem("quiz_scores_history")) || [];
    const dateStr = new Date().toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
    
    history.unshift({
        score: scoreVal,
        total: totalVal,
        date: dateStr
    });
    
    // Cap history at 5 items
    if (history.length > 5) {
        history.pop();
    }
    
    localStorage.setItem("quiz_scores_history", JSON.stringify(history));
}

function renderScoreHistory() {
    const history = JSON.parse(localStorage.getItem("quiz_scores_history")) || [];
    scoreHistory.innerHTML = "";
    
    if (history.length === 0) {
        scoreHistory.innerHTML = `<li style="justify-content: center; color: var(--text-secondary);">No quiz history yet</li>`;
        return;
    }
    
    history.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="date-val">${item.date}</span>
            <span class="score-val">${item.score} / ${item.total}</span>
        `;
        scoreHistory.appendChild(li);
    });
}

function clearScores() {
    localStorage.removeItem("quiz_scores_history");
    renderScoreHistory();
}

// Event Listeners
nextButton.addEventListener("click", handleNextButton);
restartBtn.addEventListener("click", startQuiz);
clearScoresBtn.addEventListener("click", clearScores);

// Initialization
startQuiz();
renderScoreHistory();