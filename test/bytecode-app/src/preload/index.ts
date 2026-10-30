import { ipcRenderer } from 'electron'

const square = (n: number): number => n * n
ipcRenderer.invoke('report', { square: square(7) })
