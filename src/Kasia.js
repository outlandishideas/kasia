import * as effects from 'redux-saga/effects'

import invariants from './util/invariants'
import makeReducer from './redux/reducer'
import contentTypesManager from './util/contentTypesManager'
import { setWP } from './wpapi'
import { watchRequests } from './redux/sagas'

/**
 * Components of the toolset that are extensible via plugins.
 * @type {Object}
 */
const COMPONENTS_BASE = {
  sagas: [watchRequests],
  reducers: {}
}

/**
 * Configure Kasia.
 * @param {WP} opts.WP Instance of wpapi
 * @param {String} [opts.index] Property used to key entities in the store
 * @param {Array} [opts.plugins] Kasia plugins
 * @param {Array} [opts.contentTypes] Custom content type definition objects
 * @returns {Object} Kasia reducer
 */
export default function Kasia (opts = {}) {
  const {
    WP = false,
    index = 'id',
    plugins: _plugins = [],
    contentTypes = []
  } = opts

  invariants.isWpApiInstance(WP)
  invariants.isString('index', index)
  invariants.isArray('plugins', _plugins)
  invariants.isArray('contentTypes', contentTypes)

  setWP(WP)

  const plugins = _plugins.reduce((plugins, _plugin, i) => {
    invariants.isPlugin(
      'plugin at index ' + i,
      _plugin instanceof Array ? _plugin[0] : _plugin
    )

    const plugin = _plugin instanceof Array
      ? _plugin[0](WP, _plugin[1] || {}, opts)
      : _plugin(WP, {}, opts)

    return {
      sagas: [].concat(plugins.sagas, plugin.sagas),
      reducers: Object.assign({}, plugins.reducers, plugin.reducers)
    }
  }, COMPONENTS_BASE)

  contentTypes.forEach(contentTypesManager.register)

  return {
    kasiaReducer: makeReducer({ index }, plugins),
    kasiaSagas: plugins.sagas.map((saga) => effects.spawn(saga))
  }
}
