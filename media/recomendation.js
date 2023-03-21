const category_text = document.getElementById('category-text')
const backButton = document.getElementById('back-button')
const applySuggestionButton = document.getElementById('apply-suggestion-button')
const forwardButton = document.getElementById('forward-button')
const explainInput = document.getElementById('explain-input')
const explainButton = document.getElementById('explain-submit')
const vscode = acquireVsCodeApi()

vscode.postMessage({ type: 'getInitData' })
setInterval(() => {
  vscode.postMessage({ type: 'getInitData' })
}, 500)

let bufferInput = null

explainInput.addEventListener('input', e => {
  bufferInput = e.target.value
})

explainButton.addEventListener('click', e => {
  e.preventDefault()
  vscode.postMessage({
    type: 'onSuggestionClicked',
    data: bufferInput
  })
})

function populateInitData(data) {
  category_text.innerText = `CATEGORY: ${data.vuln.category}`
}
function handleInitData(data) {
  console.log(data)
  populateInitData(data)
}

window.addEventListener('message', message => {
  const data = message.data
  switch (message.type) {
    case 'initData': {
      handleInitData(data)
      break
    }
    case 'nothing': {
      handleSuggestion(data)
      break
    }
    default:
      break
  }
})

function handleSuggestion(data) {
  console.log(data)
}
console.log(category_text, backButton, applySuggestionButton, forwardButton, explainInput, explainButton)
