import invariants from './util/invariants'

let WP = null

// Get the internal reference to the wpapi instance
export function getWP () {
  return WP
}

// Set an internal reference to the wpapi instance
export function setWP (_WP) {
  invariants.noWPInstance(WP)
  WP = _WP
}
