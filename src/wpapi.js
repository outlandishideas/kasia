import { default as _WP } from 'wpapi'

export let wpapi = null

export function WP (endpoint) {
  if (wpapi) return wpapi
  wpapi = new _WP({ endpoint })
  return wpapi
}
