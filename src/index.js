import * as effects from 'redux-saga/effects'

import debug, { toggleDebug } from './util/debug'
import createReducer from './redux/reducer'
import invariants from './invariants'
import contentTypesManager from './util/content-types-manager'
import { preloadComponents, preloadQuery, runPreloaders } from './util/preload'
import { setWP } from './wpapi'
import { watchRequests } from './redux/sagas'
import {
  createQueryRequest,
  createPostRequest,
  rewind
} from './redux/actions'

export default kasia

export { preloadComponents, preloadQuery } from './util/preload'

// Components of the toolset that are extensible via plugins
const COMPONENTS_BASE = {
  sagas: [watchRequests],
  reducers: {}
}

/** Reset the connect internal query counter.
 *  Should be called before each SSR. */
kasia.rewind = function (store) {
  store.dispatch(rewind())
}

/** Run all `preloaders` until they are complete. */
kasia.runPreloaders = function (preloaders, store, props) {
  kasia.rewind(store) // begin with a rewind
  preloaders.push(() => function * () { // and end with a rewind
    store.dispatch(rewind())
  })
  return runPreloaders(store, preloaders, props)
}

//TODO deprecated: remove in v5.1
kasia.runSagas = function (...args) {
  console.log('[kasia] runSagas has been deprecated and will be removed in v5.1. Use runPreloaders instead.')
  return kasia.runPreloaders(...args)
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
    wpapi,
    debug: enableDebugLogging = false,
    keyEntitiesBy = 'id',
    plugins: userPlugins = [],
    contentTypes = []
  } = opts

  toggleDebug(enableDebugLogging)

  debug('initialised with: ', opts)

  invariants.isWpApiInstance(setWP(wpapi))
  invariants.isKeyEntitiesByOption(keyEntitiesBy)
  invariants.isArray('plugins', userPlugins)
  invariants.isArray('contentTypes', contentTypes)

  contentTypes.forEach((type) => contentTypesManager.register(type))

  // Merge plugins into internal sagas array and reducers object
  const { sagas, reducers } = userPlugins.reduce((components, plugin, i) => {
    const isArr = plugin instanceof Array

    invariants.isPlugin(i, isArr ? plugin[0] : plugin)

    plugin = isArr
      ? plugin[0](wpapi, plugin[1] || {}, opts)
      : plugin(wpapi, {}, opts)

    const {
      sagas = [],
      reducers = {}
    } = plugin

    return {
      sagas: components.sagas.concat(sagas),
      reducers: Object.assign({}, components.reducers, reducers)
    }
  }, COMPONENTS_BASE)

  return {
    kasiaReducer: createReducer({ keyEntitiesBy, reducers }),
    kasiaSagas: sagas.map((saga) => effects.spawn(saga)),
    kasiaActions: { createQueryRequest, createPostRequest }
  }
}
