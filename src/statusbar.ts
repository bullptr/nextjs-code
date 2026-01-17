import { window, StatusBarAlignment } from 'vscode'
import { extensionCtx } from './context'

const NEXT_STATUSBAR_COLOR = '#ebb549'

export function ensureStatusBarCreated(): void {
  if (!extensionCtx.statusBar) {
    extensionCtx.statusBar = window.createStatusBarItem(StatusBarAlignment.Right, 1000)
    extensionCtx.statusBar.command = 'nextjs-code.showCommands'
    extensionCtx.statusBar.show()
  }
}

export function updateStatusBar(): void {
  ensureStatusBarCreated()
  if (!extensionCtx.statusBar) return
  if (extensionCtx.isActive) {
    extensionCtx.statusBar.text = extensionCtx.currentMode === 'serve'
      ? '$(debug-breakpoint-function) Next.js (Build)'
      : '$(debug-breakpoint-function) Next.js'
    extensionCtx.statusBar.color = NEXT_STATUSBAR_COLOR
  }
  else {
    extensionCtx.statusBar.text = '$(stop-circle) Next.js'
    extensionCtx.statusBar.color = undefined
  }
}
