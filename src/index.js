import * as effects from 'redux-saga/effects'

import debug, { toggleDebug } from './util/debug'
import makeReducer from './redux/reducer'
import invariants from './invariants'
import contentTypesManager from './util/content-types-manager'
import queryCounter from './util/query-counter'
import { default as _runSagas } from './util/run-sagas'
import { setWP } from './wpapi'
import { watchRequests } from './redux/sagas'
import { rewind as connectRewind } from './connect'
import { createQueryRequest, createPostRequest } from './redux/actions'

export * from './util/preload'

export default kasia

// Components of the toolset that are extensible via plugins
const COMPONENTS_BASE = {
  sagas: [watchRequests],
  reducers: {}
}

/** Reset the internal query counter and first mount bool.
 *  Should be called before each SSR. */
kasia.rewind = function rewind () {
  connectRewind()
  queryCounter.reset()
}

/** Run all `sagas` until they are complete. */
export function runSagas (store, sagas) {
  kasia.rewind()
  return _runSagas(store, sagas)
}

/**
 * Configure Kasia.
 * @param {WP} opts.wpapi Instance of node-wpapi
 * @param {String} [opts.keyEntitiesBy] Property used to key entities in the store
 * @param {Boolean} [opts.debug] Log debug statements
 * @param {Array} [opts.plugins] Kasia plugins
 * @param {Array} [opts.contentTypes] Custom content type definition objects
 * @returns {Object} Kasia reducer
 */
function kasia (opts = {}) {
  let {
    WP,
    wpapi,
    debug: _debug = false,
    keyEntitiesBy = 'id',
    plugins: userPlugins = [],
    contentTypes = []
  } = opts

  toggleDebug(_debug)

  debug('initialised with: ', opts)

  if (WP) {
    console.log('[kasia] config option `WP` is replaced by `wpapi` in v4.')
    wpapi = WP
  }

  invariants.isWpApiInstance(setWP(wpapi))
  invariants.isKeyEntitiesByOption(keyEntitiesBy)
  invariants.isArray('plugins', userPlugins)
  invariants.isArray('contentTypes', contentTypes)

  contentTypes.forEach((type) => contentTypesManager.register(type))

  // Merge plugins into internal sagas array and reducers object
  const { sagas, reducers } = userPlugins.reduce((components, p, i) => {
    const isArr = p instanceof Array
    invariants.isPlugin('plugin at index ' + i, isArr ? p[0] : p)
    const { sagas, reducers } = isArr ? p[0](wpapi, p[1] || {}, opts) : p(wpapi, {}, opts)
    components.sagas.push(...sagas)
    Object.assign(components.reducers, reducers)
    return components
  }, COMPONENTS_BASE)

  return {
    kasiaReducer: makeReducer({ keyEntitiesBy, reducers }),
    kasiaSagas: sagas.map((saga) => effects.spawn(saga)),
    kasiaActions: { createQueryRequest, createPostRequest }
  }
}
