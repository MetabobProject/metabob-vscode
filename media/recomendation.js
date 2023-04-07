const category_text = document.getElementById('category-text')

// const backButton = document.getElementById('back-button')
const applySuggestionButton = document.getElementById('apply-suggestion-button')

// const forwardButton = document.getElementById('forward-button')
const explainInput = document.getElementById('explain-input')
const explainButton = document.getElementById('explain-submit')
const descriptionContent = document.getElementById('description-content')
const generateRecomendationButton = document.getElementById('gen-recom')
const RecomendationContent = document.getElementById('recomendation-content')
const updateRecomendationContent = document.getElementById('gen-update-button')
const updateRecomendationInput = document.getElementById('gen-update-input')
const questionDescriptionParagraph = document.getElementById('question-description')
const applyRecomendation = document.getElementById('apply-recomendation')
const discardSuggestion = document.getElementById('discard-suggestion')
const endorseSuggestion = document.getElementById('endorse-suggestion')

const vscode = acquireVsCodeApi()

let applySuggestionLoading = false

if (applySuggestionLoading) {
}
window.addEventListener('message', message => {
  const data = message.data.data
  switch (message.data.type) {
    case 'initData': {
      handleInitData(data)
      break
    }
    case 'onSuggestionClicked:Response': {
      handleSuggestionResponse(data)
      explainButton.classList.remove('loading')
      explainButton.innerText = 'ASK'
      break
    }
    case 'onSuggestionClickedGPT:Response': {
      handleChatGPTResponse(data)
      explainButton.classList.remove('loading')
      explainButton.innerText = 'ASK'
      break
    }
    case 'onGenerateClickedGPT:Response': {
      handleGenerateResponseGPT(data)
      generateRecomendationButton.classList.remove('loading')
      updateRecomendationContent.classList.remove('loading')
      generateRecomendationButton.innerText = 'Generate'
      updateRecomendationContent.innerText = 'Update'
      break
    }
    case 'onGenerateClicked:Response': {
      handleGenerateResponse(data)
      generateRecomendationButton.classList.remove('loading')
      updateRecomendationContent.classList.remove('loading')
      generateRecomendationButton.innerText = 'Generate'
      updateRecomendationContent.innerText = 'Update'
      break
    }
    case 'onGenerateClicked:Error': {
      generateRecomendationButton.classList.remove('loading')
      updateRecomendationContent.classList.remove('loading')
      generateRecomendationButton.innerText = 'Generate'
      updateRecomendationContent.innerText = 'Update'
      break
    }
    case 'onSuggestionClicked:Error': {
      explainButton.classList.remove('loading')
      explainButton.innerText = 'ASK'
      break
    }
    case 'onDiscardSuggestionClicked:Success': {
      discardSuggestion.classList.remove('loading')
      discardSuggestion.innerText = 'Discard'
      break
    }
    case 'onDiscardSuggestionClicked:Error': {
      discardSuggestion.classList.remove('loading')
      discardSuggestion.innerText = 'Discard'
      break
    }
    case 'onEndorseSuggestionClicked:Success': {
      endorseSuggestion.classList.remove('loading')
      endorseSuggestion.innerText = 'Endorse'
      break
    }
    case 'onEndorseSuggestionClicked:Error': {
      endorseSuggestion.classList.remove('loading')
      endorseSuggestion.innerText = 'Endorse'
      break
    }
  }
})

vscode.postMessage({ type: 'getInitData' })

setInterval(() => {
  vscode.postMessage({ type: 'getInitData' })
}, 1000)

let bufferInput = null
let recoBufferInput = null
let initData = null

explainInput.addEventListener('input', e => {
  bufferInput = e.target.value
})

updateRecomendationInput.addEventListener('input', e => {
  recoBufferInput = e.target.value
})

applyRecomendation.addEventListener('click', e => {
  e.preventDefault()
  const recomendation = RecomendationContent.textContent
  vscode.postMessage({
    type: 'applyRecomendation',
    data: {
      input: recomendation,
      initData
    }
  })
})
generateRecomendationButton.addEventListener('click', e => {
  e.preventDefault()
  generateRecomendationButton.classList.add('loading')
  generateRecomendationButton.innerText = ''
  vscode.postMessage({
    type: 'onGenerateClicked',
    data: {
      input: bufferInput,
      initData
    }
  })
})

applySuggestionButton.addEventListener('click', e => {
  e.preventDefault()
  applySuggestionButton.classList.add('loading')
  applySuggestionButton.innerText = ''
  const suggestion = descriptionContent.textContent
  vscode.postMessage({
    type: 'applySuggestion',
    data: {
      input: suggestion,
      initData
    }
  })
  applySuggestionButton.classList.remove('loading')
  applySuggestionButton.innerText = 'Apply >>'
})
updateRecomendationContent.addEventListener('click', e => {
  updateRecomendationContent.classList.add('loading')
  updateRecomendationContent.innerText = ''
  e.preventDefault()
  vscode.postMessage({
    type: 'onGenerateClicked',
    data: {
      input: recoBufferInput,
      initData
    }
  })
})

explainButton.addEventListener('click', e => {
  explainButton.classList.add('loading')
  explainButton.innerText = ''
  e.preventDefault()
  vscode.postMessage({
    type: 'onSuggestionClicked',
    data: {
      input: bufferInput,
      initData
    }
  })
})

discardSuggestion.addEventListener('click', e => {
  e.preventDefault()
  vscode.postMessage({
    type: 'onDiscardSuggestionClicked',
    data: {
      initData
    }
  })
})

endorseSuggestion.addEventListener('click', e => {
  e.preventDefault()
  vscode.postMessage({
    type: 'onEndorseSuggestionClicked',
    data: {
      initData
    }
  })
})
function populateInitData(data) {
  category_text.innerText = `${data.vuln.category}`
  questionDescriptionParagraph.innerText = `${data.vuln.description}`
  initData = data

  return
}

function handleInitData(data) {
  populateInitData(data)

  return
}

function handleSuggestionResponse({ description }) {
  descriptionContent.innerText = ''
  descriptionContent.innerText = `${description}`
}

function handleGenerateResponse({ recommendation }) {
  RecomendationContent.innerText = ''
  RecomendationContent.innerText = `${recommendation}`
}

function handleChatGPTResponse(data) {
  descriptionContent.innerText = ''
  descriptionContent.innerText = data.choices[0].message.content
}

function handleGenerateResponseGPT(data) {
  RecomendationContent.innerText = ''
  RecomendationContent.innerText = data.choices[0].message.content
}
