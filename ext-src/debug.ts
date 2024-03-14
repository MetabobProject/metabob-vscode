import { OutputChannel, window } from 'vscode'

class Debug {
  _debug: OutputChannel

  constructor() {
    this._debug = window.createOutputChannel('Metabob-Debug')
  }

  show(isShow: boolean): void {
    this._debug.show(isShow)
  }

  appendLine(line: string): void {
    this._debug.appendLine(line)
  }

  clear() {
    this._debug.clear()
  }

  dispose() {
    this._debug.dispose()
  }
}

const debugChannel = new Debug()
debugChannel.show(false)
export default debugChannel
