import { workspace } from 'vscode'
import { getRunScriptCommand } from './utils'
import type { BrowserMode } from './types'

class NextConfig {
  get rootDir(): string {
    return workspace.workspaceFolders?.[0]?.uri?.fsPath || ''
  }
  get autoStart(): boolean           { return getConfig('autoStart', true) }
  get browserType(): BrowserMode     { return getConfig<BrowserMode>('browserType', 'embedded') }
  get serverPingInterval(): number   { return getConfig('serverPingInterval', 200) }
  get startupTimeout(): number       { return getConfig('startupTimeout', 30_000) }
  get revealTerminal(): boolean      { return getConfig('revealTerminal', false) }
  get notifyOnStart(): boolean       { return getConfig('notifyOnStart', true) }
  get defaultPort(): number          { return getConfig('defaultPort', 4000) }
  get host(): string                 { return getConfig('host', 'localhost') }
  get useHttps(): boolean            { return getConfig('useHttps', false) }
  get basePath(): string             { return getConfig('basePath', '') }
  get devScript(): string            { return getConfig('devScript') || getRunScriptCommand('dev') }
  get buildScript(): string          { return getConfig('buildScript') || getRunScriptCommand('build') }
  get serveScript(): string          { return getConfig('serveScript') || getRunScriptCommand('start') }
  get autoOpen(): boolean            { return getConfig('open', true) }
}

function getConfig<T = any>(key: string, fallback?: T): T {
  return workspace.getConfiguration().get<T>(`nextjs-code.${key}`, fallback as T)
}

export const Config = new NextConfig()
