import http from 'http'
import https from 'https'
import { join } from 'path'
import fs from 'fs'
import { extensionCtx } from './context'
import type { PackageJson } from 'types-package-json'
import { Config } from './config'

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = http.createServer()
      .listen(port, () => {
        server.close()
        resolve(true)
      })
      .on('error', () => {
        resolve(false)
      })
  })
}

export async function findFreePort(startPort = 4000): Promise<number> {
  let port = startPort
  for (let attempts = 0; attempts < 25; attempts++, port++) {
    if (await checkPortAvailable(port)) return port
  }
  throw new Error('No free ports found')
}

export function pingServer(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const isHttps = url.startsWith('https')
    const requester = isHttps ? https.request : http.request

    const req = requester(url, () => {
      resolve(true)
      req.destroy()
    })
    req.on('error', () => {
      resolve(false)
      req.destroy()
    })
    req.write('')
    req.end()
  })
}

export async function waitForServerReady(
  url: string,
  interval = 200,
  maxTime = 30_000
): Promise<boolean> {
  let n = Math.ceil(maxTime / interval)
  while (n-- > 0) {
    if (await pingServer(url)) return true
    await delay(interval)
  }
  return false
}

export function isNextProject(): boolean {
  return [
    'next.config.ts', 'next.config.js'
  ].some(cfg => fs.existsSync(join(Config.rootDir, cfg)))
}

export function loadPackageJSON(): Partial<PackageJson> | undefined {
  const path = join(Config.rootDir, 'package.json')
  try {
    if (fs.existsSync(path))
      return JSON.parse(fs.readFileSync(path, 'utf-8'))
  } catch { /* ignore */ }
  return undefined
}

export function hasDependency(dep: string): boolean {
  return Boolean(
    extensionCtx.packageJSON?.dependencies?.[dep]
    || extensionCtx.packageJSON?.devDependencies?.[dep]
  )
}

export function hasNodeModules(): boolean {
  return fs.existsSync(join(Config.rootDir, 'node_modules'))
}

export function getPackageManager(): 'pnpm' | 'yarn' | 'npm' {
  if (fs.existsSync(join(Config.rootDir, 'pnpm-lock.yaml')))
    return 'pnpm'
  if (fs.existsSync(join(Config.rootDir, 'yarn.lock')))
    return 'yarn'
  return 'npm'
}

export function getInstallCommand(): string {
  switch (getPackageManager()) {
    case 'pnpm': return 'pnpm install'
    case 'yarn': return 'yarn install'
    default:     return 'npm install'
  }
}

export function getRunScriptCommand(script: string): string {
  switch (getPackageManager()) {
    case 'pnpm': return `pnpm run ${script}`
    case 'yarn': return `yarn ${script}`
    default:     return `npm run ${script}`
  }
}

export function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
}

export function buildServerUrl(port: number): string {
  return `${Config.useHttps ? 'https' : 'http'}://${Config.host}:${port}${Config.basePath}`
}
