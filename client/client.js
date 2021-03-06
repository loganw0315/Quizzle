
const startButton = document.getElementById('start-btn')
const nextButton = document.getElementById('next-btn')
const resultsButton = document.getElementById('results-btn')
const questionContainerElement = document.getElementById('question-container')
const questionElement = document.getElementById('question')
const answerButtonsElement = document.getElementById('answer-buttons')
const correctSound = new Audio('correct.wav')
const wrongSound = new Audio('wrong.mp3')
const resultsList = document.getElementById('question-results-list')
const selectQuizButton = document.getElementById('dropbtn')
const menuButton = document.getElementById('menu-btn')
const body = document.querySelector('body')
let shuffledQuestions, currentQuestionIndex, questions, totalQuestions


//adding listeners to dropdown buttons, changes current quiz on server side
document.getElementById('quiz-1').addEventListener("click", () => {
  selectQuizButton.textContent="Food"
  axios.put(`/api/quiz/quiz1`)
    .then(res =>{
      console.log(res.data);
    })
    document.getElementById("dropdown-content").classList.add('hide')
})
document.getElementById('quiz-2').addEventListener("click", () => {
  selectQuizButton.textContent="Science & Nature"
  axios.put(`/api/quiz/quiz2`)
    .then(res =>{
      console.log(res.data);
    })
  document.getElementById("dropdown-content").classList.add('hide')

})
document.getElementById('quiz-3').addEventListener("click", () => {
  selectQuizButton.textContent="Video Games"
  axios.put(`/api/quiz/quiz3`)
    .then(res =>{
      console.log(res.data);
    })
  document.getElementById("dropdown-content").classList.add('hide')

})

document.getElementById('dropbtn').addEventListener('click', () =>{
  document.getElementById("dropdown-content").classList.remove('hide')
})

//adding listeners to controller buttons
menuButton.addEventListener('click', goToMainMenu)
startButton.addEventListener('click', startQuiz)
nextButton.addEventListener('click', () => {
  currentQuestionIndex++
  setNextQuestion()
})
resultsButton.addEventListener('click', showResults)


//Starts/restarts quiz, triggered by pressing the Begin Quiz button 
function startQuiz() {
  totalQuestions = 0;
  if(selectQuizButton.textContent !== "Select Quiz"){
  startButton.classList.add('hide')
  selectQuizButton.classList.add('hide')
  menuButton.classList.remove('hide')
  body.id = ''
  axios.get(`/api/quiz`)
    .then(res =>{
      questions = res.data
      console.log(res.data);
      shuffledQuestions = questions.sort(() => Math.random() - .5)
      currentQuestionIndex = 0
      questionContainerElement.classList.remove('hide')
      setNextQuestion()
    })
  }else{
    alert("Please select a quiz");
  }
  axios.delete(`/api/stats/`)
}
//Resets page to the quiz app default, triggered by pressing Main Menu button
function goToMainMenu() {
  const resultsHeader = document.getElementById('results-header')
  if(resultsHeader){
    resultsHeader.innerHTML=""
  }
  
  resetPage()
  menuButton.classList.add('hide')
  selectQuizButton.classList.remove('hide')
  startButton.classList.remove('hide')
  resultsButton.classList.add('hide')
  questionContainerElement.classList.add('hide')
  
  selectQuizButton.textContent = "Select Quiz"
  startButton.textContent = "Begin Quiz"
  currentQuestionIndex = 0
  resultsList.innerHTML="" 
  body.id = ''
  Array.from(answerButtonsElement.children).forEach(button => {
    button.classList.add('hide')
  })
  axios.delete(`/api/stats/`)
}
//Resets page and triggers the function to show next question, triggered by pressing the Next and Begin Quiz buttons
function setNextQuestion() {
  resetPage()
  showQuestion(shuffledQuestions[currentQuestionIndex])
}
//Displays the next question, trigged by the setNextQuestion function
function showQuestion(question) {
  questionContainerElement.classList.remove('hide')
  questionElement.innerText = question.question
  question.answers.forEach(answer => {
    const button = document.createElement('button')
    button.innerText = answer.text
    button.classList.add('btn')
    if (answer.correct) {
      button.dataset.correct = answer.correct
    }
    button.addEventListener('click', selectAnswer)
    answerButtonsElement.appendChild(button)
  })
}
//Clear elements to prepare page for new elements to be created, trigged by the setNextQuestion function
function resetPage() {
  const resultsHeader = document.getElementById('results-header')
  if(resultsHeader){
    resultsHeader.innerHTML=""
  }
  
  clearStatusClass(document.body)
  nextButton.classList.add('hide')
  questionElement.classList.remove('hide')
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
  Array.from(answerButtonsElement.children).forEach(button => {
    button.classList.remove('hide')
  })

  resultsList.classList.add('hide')
}
//Sends stats about answer to current question to server, triggers animations and sounds, shows next button between questions, and results button at the end of the quiz
function selectAnswer(e) {
  const selectedButton = e.target
  const correct = selectedButton.dataset.correct
  let answer = {
      question: questionElement.textContent,
      correct: correct
  }
  axios.post(`/api/stats/`, answer)
    .then(res => {
      console.log(res);
    })
  if(correct){
    correctSound.play()
    party.confetti(this, {
        count: party.variation.range(20, 40),
    });
    correctSound.play()
  }else{
    wrongSound.play()
  }
  
  setStatusClass(document.body, correct)
  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct)
    button.removeEventListener('click', selectAnswer)
  })
  if (shuffledQuestions.length > currentQuestionIndex + 1) {
    nextButton.classList.remove('hide')
  } else {
    resultsButton.classList.remove('hide')
  }
}
//Fills the results page with stats, triggered by clicking Results button
function showResults(){
    questionElement.classList.add('hide')
    resultsList.classList.remove('hide')
    resultsButton.classList.add('hide')
    startButton.innerText = 'Restart'
    startButton.classList.remove('hide')
    let resultsHeader = document.createElement('div')
    resultsHeader.id = 'results-header'
    resultsHeader.textContent = 'Results'
    body.id = 'main-page'
    clearStatusClass(document.body )
    questionContainerElement.prepend(resultsHeader)
    Array.from(answerButtonsElement.children).forEach(button => {
        button.classList.add('hide')
      })
    resultsList.innerHTML=""  
    
    axios.get(`/api/stats/`)
    .then(res => {
        
    for(let i=0; i<res.data[0].length;i++){
    let {question, correct} = res.data[0][i]    
    let questionResult = document.createElement('li')
    let questionResultQuestion = document.createElement('span')
    let questionResultPicture = document.createElement('img')
    questionResultQuestion.textContent= `${question} ` 
    questionResultPicture.classList.add('result-picture')
    if(correct){
      questionResultPicture.src="/images/greencheck.png"
    }else{
      questionResultPicture.src="/images/redx.png"
    }
    questionResult.appendChild(questionResultQuestion)
    questionResult.appendChild(questionResultPicture)
    resultsList.appendChild(questionResult)  
    }

    let correctCount = res.data[1]
    let wrongCount = res.data[2]
    totalQuestions = (+correctCount)+(+wrongCount)
    let resultsTotal = document.createElement('p')
    resultsTotal.textContent = `${correctCount}/${totalQuestions}`
    resultsHeader.appendChild(resultsTotal)
    axios.delete(`/api/stats/`)
    
    })


    
}
//Sets background and button color to match answer correctness
function setStatusClass(element, correct) {
  clearStatusClass(element)
  if (correct) {
    element.classList.add('correct')
  } else {
    element.classList.add('wrong')
  }
}
//Resets element classes
function clearStatusClass(element) {
  element.classList.remove('correct')
  element.classList.remove('wrong')
}

