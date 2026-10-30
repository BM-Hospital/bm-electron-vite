import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { add } from './util'

// Must stay unreadable in the compiled .jsc (see `protectedStrings` in the config).
const SECRET = 'TOP_SECRET_KEY'
const result: Record<string, unknown> = {}

app.whenReady().then(async () => {
  result.add = add(2, 3)
  result.secretMatches = SECRET === ['TOP', 'SECRET', 'KEY'].join('_')
  result.lazy = (await import('./lazy')).lazyValue()
  result.dirname = typeof __dirname === 'string'

  ipcMain.handle('report', (_event, fromPreload: unknown) => {
    result.preload = fromPreload
    console.log('RESULT ' + JSON.stringify(result))
    app.quit()
  })

  const win = new BrowserWindow({
    show: false,
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false }
  })
  win.loadFile(join(__dirname, '../renderer/index.html'))
})
