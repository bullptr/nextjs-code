import * as assert from 'assert'
import * as sinon from 'sinon'
import * as fs from 'fs'

import * as utils from '../utils'
import { extensionCtx } from '../context'

describe('Utils', () => {
  describe('capitalize', () => {
    it('capitalizes the first letter', () => {
      assert.equal(utils.capitalize('hello'), 'Hello')
      assert.equal(utils.capitalize(''), '')
      assert.equal(utils.capitalize('a'), 'A')
    })
  })

  describe('getPackageManager', () => {
    const fakeDir = '/tmp/test-vscode-ext'
    afterEach(() => {
      sinon.restore()
    })

    it('returns pnpm if pnpm-lock.yaml exists', () => {
      sinon.stub(fs, 'existsSync').callsFake((filepath: any) => `${filepath}`.includes('pnpm-lock.yaml'))
      assert.equal(utils.getPackageManager(), 'pnpm')
    })
    it('returns yarn if yarn.lock exists', () => {
      sinon.stub(fs, 'existsSync').callsFake((filepath: any) => `${filepath}`.includes('yarn.lock'))
      assert.equal(utils.getPackageManager(), 'yarn')
    })
    it('returns npm as default', () => {
      sinon.stub(fs, 'existsSync').returns(false)
      assert.equal(utils.getPackageManager(), 'npm')
    })
  })

  describe('getInstallCommand', () => {
    afterEach(() => sinon.restore())

    it('returns correct install command for pnpm', () => {
      sinon.stub(utils, 'getPackageManager').returns('pnpm')
      assert.equal(utils.getInstallCommand(), 'pnpm install')
    })
    it('returns correct install command for yarn', () => {
      sinon.stub(utils, 'getPackageManager').returns('yarn')
      assert.equal(utils.getInstallCommand(), 'yarn install')
    })
    it('returns correct install command for npm', () => {
      sinon.stub(utils, 'getPackageManager').returns('npm')
      assert.equal(utils.getInstallCommand(), 'npm install')
    })
  })

  describe('getRunScriptCommand', () => {
    afterEach(() => sinon.restore())

    it('returns correct script command', () => {
      sinon.stub(utils, 'getPackageManager').returns('pnpm')
      assert.equal(utils.getRunScriptCommand('dev'), 'pnpm run dev')

      sinon.stub(utils, 'getPackageManager').returns('yarn')
      assert.equal(utils.getRunScriptCommand('dev'), 'yarn dev')

      sinon.stub(utils, 'getPackageManager').returns('npm')
      assert.equal(utils.getRunScriptCommand('dev'), 'npm run dev')
    })
  })

  describe('hasDependency', () => {
    afterEach(() => extensionCtx.packageJSON = undefined)
    it('detects dependencies in package.json', () => {
      extensionCtx.packageJSON = {
        dependencies: { next: '^13.0.0' }
      }
      assert.equal(utils.hasDependency('next'), true)
      assert.equal(utils.hasDependency('react'), false)
    })
    it('detects devDependencies in package.json', () => {
      extensionCtx.packageJSON = {
        devDependencies: { next: '^13.0.0' }
      }
      assert.equal(utils.hasDependency('next'), true)
    })
  })
})
