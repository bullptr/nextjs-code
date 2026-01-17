import * as assert from 'assert'
import * as sinon from 'sinon'
// Mock the VSCode API:
import { workspace } from 'vscode'
import { Config } from '../config'

describe('Config', () => {
  afterEach(() => sinon.restore())

  it('should return config values with fallback if config not set', () => {
    sinon.stub(workspace, 'getConfiguration').returns({
      get: <T>(_: string, fallback?: T) => fallback,
    } as any)

    assert.equal(Config.defaultPort, 4000)
    assert.equal(Config.autoOpen, true)
    assert.equal(Config.host, 'localhost')
  })
})
