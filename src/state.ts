import { window, Terminal } from 'vscode'
import { extensionCtx } from './context'
import { buildServerUrl, pingServer } from './utils'

export async function restoreTerminalIfPossible(): Promise<boolean | undefined> {
  if (extensionCtx.terminal) return
  const storedPid = extensionCtx.ext.globalState.get<number>('pid')
  if (!storedPid) return

  const terminalsWithPID = await Promise.all(
    window.terminals.map(async t =>
      (storedPid === await t.processId) ? t : undefined
    )
  )

  const recovered = terminalsWithPID.find(Boolean) as Terminal | undefined
  if (recovered) {
    extensionCtx.terminal = recovered
    return true
  }
  return false
}

export async function restorePreviousStateIfAvailable(): Promise<boolean | undefined> {
  if (!await restoreTerminalIfPossible())
    return

  const port = +(extensionCtx.ext.globalState.get<number>('port') || 0)
  if (!port) return

  const url = buildServerUrl(port)
  if (!await pingServer(url)) return

  extensionCtx.isActive = true
  extensionCtx.currentUrl = url
  extensionCtx.currentPort = port
  extensionCtx.currentMode = extensionCtx.ext.globalState.get('mode') || 'dev'
  return true
}
