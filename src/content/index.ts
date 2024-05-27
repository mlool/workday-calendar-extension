import { runtime } from 'webextension-polyfill'

console.log('[content] loaded ')

type Listener = (event: MouseEvent) => void

let count = 0

function registerClickListener(listener: Listener) {
  window.addEventListener('click', listener)

  // step 2
  return function cleanup() {
    window.removeEventListener('click', listener)
  }
}

async function countClicks() {
  count++
  console.log('click(): ', count)
  // step 2
  return runtime.sendMessage({ from: 'content', to: 'background', action: 'click' })
}

export function init() {
  registerClickListener(countClicks)
}

init()
