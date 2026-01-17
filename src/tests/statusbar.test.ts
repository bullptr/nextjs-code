import * as assert from 'assert'
import * as sinon from 'sinon'
import { window } from 'vscode'
import { extensionCtx } from '../context'
import * as statusbar from '../statusbar'

describe('Statusbar', () => {
  afterEach(() => {
    sinon.restore()
    extensionCtx.statusBar = undefined
  })

  it('creates the status bar if not exists', () => {
    const createStub = sinon.stub(window, 'createStatusBarItem').callsFake(() => ({
      show: sinon.stub(),
      command: '',
      text: '',
      color: '',
    }) as any)
    statusbar.ensureStatusBarCreated()
    assert.ok(extensionCtx.statusBar)
    assert.ok(createStub.calledOnce)
  })

  it('updates status bar for active and inactive state', () => {
    const item = { show: sinon.stub(), command: '', text: '', color: '' }
    extensionCtx.statusBar = item as any

    extensionCtx.isActive = true
    extensionCtx.currentMode = 'serve'
    statusbar.updateStatusBar()
    assert.ok(item.text.includes('Next.js'))
    extensionCtx.isActive = false
    statusbar.updateStatusBar()
    assert.ok(item.text.includes('Next.js'))
  })
})
