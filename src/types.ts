import type { PackageJson } from 'types-package-json'
import type { ExtensionContext, Terminal, StatusBarItem, QuickPickItem } from 'vscode'

export type NextServerMode = 'dev' | 'serve'
export type BrowserMode = 'system' | 'embedded'

export interface NextJSContext {
  ext: ExtensionContext
  terminal?: Terminal
  statusBar?: StatusBarItem
  currentMode: NextServerMode
  isActive: boolean
  currentPort?: number
  currentUrl?: string
  webviewPanel?: { show?: () => any; disposed?: boolean; dispose?: () => void }
  packageJSON?: Partial<PackageJson>
}

export interface CommandQuickPickItem extends QuickPickItem {
  handler?: () => Promise<void> | void
  showIf?: boolean
}
