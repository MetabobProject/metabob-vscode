const category_text = document.getElementById('category-text')
const backButton = document.getElementById('back-button')
const applySuggestionButton = document.getElementById('apply-suggestion-button')
const forwardButton = document.getElementById('forward-button')
const explainInput = document.getElementById('explain-input')
const explainButton = document.getElementById('explain-submit')
const descriptionContent = document.getElementById('description-content')

const vscode = acquireVsCodeApi()

// let doIGetCurrentValueAgain = true
let intervalRef = null

window.addEventListener('message', message => {
  const data = message.data.data
  switch (message.data.type) {
    case 'initData': {
      handleInitData(data)
      break
    }
    case 'onSuggestionClicked:Response': {
      handleSuggestionResponse(data)
      break
    }
  }
})

vscode.postMessage({ type: 'getInitData' })

setInterval(() => {
  vscode.postMessage({ type: 'getInitData' })
}, 1000)

let bufferInput = null
let initData = null

explainInput.addEventListener('input', e => {
  bufferInput = e.target.value
})

explainButton.addEventListener('click', e => {
  e.preventDefault()
  vscode.postMessage({
    type: 'onSuggestionClicked',
    data: {
      input: bufferInput,
      initData
    }
  })
})

function populateInitData(data) {
  category_text.innerText = `CATEGORY: ${data.vuln.category}`

  // descriptionContent.innerText = `${data.vuln.description}`
  initData = data

  return
}

function handleInitData(data) {
  populateInitData(data)

  return
}

function handleSuggestionResponse({ description }) {
  doIGetCurrentValueAgain = false
  clearInterval(intervalRef)
  descriptionContent.innerText = ''
  descriptionContent.innerText = `${description}`
}

console.log(category_text, backButton, applySuggestionButton, forwardButton, explainInput, explainButton)
