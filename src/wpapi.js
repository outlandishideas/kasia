let WP

export default function getWP () {
  if (!WP) throw new Error('WP not set')
  return WP
}

export function setWP (_WP) {
  WP = _WP
  return WP
}
