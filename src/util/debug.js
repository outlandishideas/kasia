let on = false

export default function debug (...args) {
  if (on) console.log('[kasia debug]', ...args)
}

export function toggleDebug (bool) {
  on = bool
}
