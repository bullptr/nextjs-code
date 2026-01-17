import * as sinon from 'sinon'
import * as assert from 'assert'
import { window } from 'vscode'
import { extensionCtx } from '../context'
import * as terminal from '../terminal'

describe('Terminal', () => {
  afterEach(() => {
    sinon.restore()
    extensionCtx.terminal = undefined
  })

  it('should create terminal if not live', () => {
    sinon.stub(window, 'createTerminal').returns({ show: () => {}, sendText: () => {}, dispose: () => {}, exitStatus: null } as any)
    terminal.ensureTerminalCreated()
    assert.ok(extensionCtx.terminal)
  })

  it('should close the terminal', () => {
    const dispose = sinon.stub()
    extensionCtx.terminal = { sendText: sinon.stub(), dispose: dispose, exitStatus: null } as any
    terminal.closeTerminal()
    assert.ok(dispose.calledOnce)
    assert.equal(extensionCtx.terminal, undefined)
  })
})
