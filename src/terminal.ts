import { window, StatusBarAlignment } from 'vscode'
import { extensionCtx } from './context'
import { Config } from './config'
import { delay } from './utils'

export function ensureTerminalCreated(): void {
  if (!isTerminalLive()) {
    extensionCtx.terminal = window.createTerminal('NextJS Code')
  }
}

export function isTerminalLive(): boolean {
  return !!extensionCtx.terminal && extensionCtx.terminal.exitStatus == null
}

export function closeTerminal(): void {
  if (isTerminalLive()) {
    extensionCtx.terminal!.sendText('\x03')
    extensionCtx.terminal!.dispose()
    extensionCtx.terminal = undefined
  }
}

export function killProcess(): void {
  if (isTerminalLive())
    extensionCtx.terminal!.sendText('\x03')
  extensionCtx.ext.globalState.update('pid', undefined)
}

export async function executeTerminalCommand(cmd: string): Promise<void> {
  ensureTerminalCreated()
  extensionCtx.terminal!.sendText(cmd)
  if (Config.revealTerminal)
    extensionCtx.terminal!.show(false)
  await delay(2000)
  const pid = await extensionCtx.terminal!.processId
  if (pid)
    extensionCtx.ext.globalState.update('pid', pid)
}
