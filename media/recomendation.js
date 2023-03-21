const category_text = document.getElementById('category-text')
const backButton = document.getElementById('back-button')
const applySuggestionButton = document.getElementById('apply-suggestion-button')
const forwardButton = document.getElementById('forward-button')
const explainInput = document.getElementById('explain-input')
const explainButton = document.getElementById('explain-submit')
const vscode = acquireVsCodeApi()

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

window.addEventListener('message', message => {
  const data = message.data
  switch (message.type) {
    case '': {
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
