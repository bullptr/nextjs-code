import { window } from 'vscode'
import { extensionCtx } from './context'
import { start, stop, open } from './commands'
import type { CommandQuickPickItem } from './types'

export async function showCommands(): Promise<void> {
  const pickOptions: CommandQuickPickItem[] = [
    {
      label: '$(debug-breakpoint-function) Start Next.js server',
      handler: () => start(),
      showIf: !extensionCtx.isActive,
    },
    {
      label: '$(split-horizontal) Open in embedded browser',
      description: extensionCtx.currentUrl,
      handler: () => open({ autoStart: true, browser: 'embedded' }),
      showIf: Boolean(extensionCtx.currentUrl),
    },
    {
      label: '$(link-external) Open in system browser',
      description: extensionCtx.currentUrl,
      handler: () => open({ autoStart: true, browser: 'system' }),
      showIf: Boolean(extensionCtx.currentUrl),
    },
    {
      label: extensionCtx.currentMode === 'dev'
        ? `$(refresh) Restart Next.js server`
        : '$(debug-breakpoint-function) Switch to dev server',
      handler: async () => {
        const needsReopenEmbedded =
          !!extensionCtx.webviewPanel &&
          extensionCtx.isActive &&
          extensionCtx.currentMode !== 'dev'
        await start({ mode: 'dev', searchPort: extensionCtx.currentMode !== 'dev' })
        if (needsReopenEmbedded) await open({ browser: 'embedded' })
      },
      showIf: extensionCtx.isActive,
    },
    {
      label: extensionCtx.isActive && extensionCtx.currentMode === 'serve'
        ? '$(package) Rebuild and Serve'
        : '$(package) Build and Serve',
      handler: async () => {
        const needsReopen =
          !!extensionCtx.webviewPanel &&
          extensionCtx.isActive &&
          extensionCtx.currentMode !== 'serve'
        await start({ mode: 'serve', searchPort: extensionCtx.currentMode !== 'serve' })
        if (needsReopen) await open({ browser: 'embedded' })
      },
      showIf: true,
    },
    {
      label: '$(terminal) Stop terminal',
      handler: () => stop(),
      showIf: extensionCtx.isActive,
    },
    {
      label: '$(close) Stop server',
      handler: () => stop(),
      showIf: extensionCtx.isActive,
    },
  ]
  const selected = await window.showQuickPick(
    pickOptions.filter(item => item.showIf !== false)
  )
  if (selected?.handler) await selected.handler()
}
