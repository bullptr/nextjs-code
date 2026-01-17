import { window, commands, env, Uri } from 'vscode'
import { extensionCtx } from './context'
import { Config } from './config'
import { showCommands } from './quickpick'
import { closeTerminal, killProcess, executeTerminalCommand } from './terminal'
import { updateStatusBar } from './statusbar'
import { findFreePort, buildServerUrl, delay, hasNodeModules, getInstallCommand, loadPackageJSON, isNextProject, waitForServerReady } from './utils'
import { restorePreviousStateIfAvailable } from './state'

export async function activate(ext: any) {
  extensionCtx.ext = ext
  commands.registerCommand('nextjs-code.stop', stop)
  commands.registerCommand('nextjs-code.restart', start)
  commands.registerCommand('nextjs-code.open', () => open())
  commands.registerCommand('nextjs-code.showCommands', showCommands)

  window.onDidCloseTerminal((closedTerm) => {
    if (closedTerm === extensionCtx.terminal) {
      stop()
      extensionCtx.terminal = undefined
    }
  })

  extensionCtx.packageJSON = loadPackageJSON()

  if (!isNextProject()) return

  await restorePreviousStateIfAvailable()
  updateStatusBar()

  if (Config.autoStart) {
    if (!hasNodeModules()) {
      const installCmd = getInstallCommand()
      const resp = await window.showWarningMessage(
        'NextJS Code: No node_modules found. Install dependencies now?',
        `Install (${installCmd})`, 'Cancel'
      )
      if (resp !== `Install (${installCmd})`) return
      await executeTerminalCommand(installCmd)
      await delay(5000)
    }
    if (Config.autoOpen)
      await open({ autoStart: true, stopPrevious: false })
  }
}

export async function deactivate() {
  closeTerminal()
}

export async function start(
  options: {
    mode?: 'dev' | 'serve',
    searchPort?: boolean,
    waitForStart?: boolean,
    stopPrevious?: boolean
  } = {},
): Promise<void> {
  const {
    mode = 'dev',
    searchPort = !extensionCtx.isActive,
    waitForStart = true,
    stopPrevious = true,
  } = options

  if (stopPrevious) stop()
  if (mode !== extensionCtx.currentMode) closeWebPanel()

  extensionCtx.currentMode = mode

  if (!extensionCtx.currentPort || searchPort) {
    extensionCtx.currentPort = await findFreePort(Config.defaultPort)
  }
  extensionCtx.currentUrl = buildServerUrl(extensionCtx.currentPort)
  extensionCtx.ext.globalState.update('port', extensionCtx.currentPort)

  if (mode === 'dev') {
    await executeTerminalCommand(`${Config.devScript} --port=${extensionCtx.currentPort}`)
  } else {
    await executeTerminalCommand(Config.buildScript)
    await executeTerminalCommand(`${Config.serveScript} -p ${extensionCtx.currentPort}`)
  }

  if (waitForStart) {
    const isReady = await waitForServerReady(extensionCtx.currentUrl, Config.serverPingInterval, Config.startupTimeout)
    if (!isReady) {
      window.showErrorMessage('❗️ Failed to start the server')
      stop()
      return
    } else if (Config.notifyOnStart) {
      window.showInformationMessage(
        mode === 'serve'
          ? `📦 Next.js build served at ${extensionCtx.currentUrl}`
          : `⚡️ Next.js started at ${extensionCtx.currentUrl}`
      )
    }
  }

  extensionCtx.isActive = true
  updateStatusBar()
}

export function stop(): void {
  extensionCtx.isActive = false
  killProcess()
  updateStatusBar()
}

/**
 * Opens the app in either embedded or system browser.
 */
export async function open({
  autoStart = false,
  browser = Config.browserType,
  stopPrevious = true,
}: {
  autoStart?: boolean,
  browser?: 'system' | 'embedded',
  stopPrevious?: boolean,
} = {}): Promise<void> {
  if (!extensionCtx.isActive && autoStart)
    await start({ stopPrevious })

  if (!extensionCtx.isActive || !extensionCtx.currentUrl)
    return

  if (browser === 'system') {
    env.openExternal(Uri.parse(extensionCtx.currentUrl))
  }
  else if (browser === 'embedded') {
    if (!extensionCtx.webviewPanel || extensionCtx.webviewPanel.disposed) {
      extensionCtx.webviewPanel = await commands.executeCommand('browse-lite.open', extensionCtx.currentUrl) as { show?: () => void }
    }
    try { extensionCtx.webviewPanel?.show?.() } catch { }
  }
}

export function closeWebPanel(): void {
  extensionCtx.webviewPanel?.dispose?.()
  extensionCtx.webviewPanel = undefined
}
