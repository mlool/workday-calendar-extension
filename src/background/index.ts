import { runtime, storage } from 'webextension-polyfill'
import { getCurrentTab } from '../helpers/tabs'

type Message = {
  from: string
  to: string
  action: string
}

async function incrementStoredValue(tabId: string) {
  const data = await storage.local.get(tabId)
  const currentValue = data?.[tabId] ?? 0

  return storage.local.set({ [tabId]: currentValue + 1 })
}

export async function init() {
  await storage.local.clear()

  runtime.onMessage.addListener(async (message: Message) => {
    if (message.to === 'background') {
      console.log('background handled: ', message.action)

      const tab = await getCurrentTab()
      const tabId = tab.id

      if (tabId) {
        return incrementStoredValue(tabId.toString())
      }
    }
  })
}

runtime.onInstalled.addListener(() => {
  init().then(() => {
    console.log('[background] loaded ')
  })
})
