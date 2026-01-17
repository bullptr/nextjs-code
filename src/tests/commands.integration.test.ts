import * as assert from 'assert'
import * as commands from '../commands'
import { extensionCtx } from '../context'

suite('Commands (integration)', function() {
  this.timeout(10000)

  test('activate registers commands and sets up context', async () => {
    const extMock = {
      globalState: {
        get: () => undefined,
        update: () => undefined
      }
    }
    // Should not throw if no Next project
    await commands.activate(extMock as any)
    assert.ok(extensionCtx.ext)
  })
})
