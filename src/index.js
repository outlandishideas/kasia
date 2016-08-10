import merge from 'lodash.merge'
import * as effects from 'redux-saga/effects'

import invariants from './invariants'
import makeReducer from './reducer'
import { setWP } from './wpapi'
import { watchRequests } from './sagas'
import { registerContentType } from './contentTypes'

/**
 * Components of the toolset that are extensible via plugins.
 * @type {Object}
 */
const componentsBase = {
  sagas: [watchRequests],
  reducers: {}
}

/**
 * Configure Kasia.
 * @param {WP} opts.WP Instance of node-wpapi
 * @param {String} [opts.keyEntitiesBy] Property used to key entities in the store
 * @param {Array} [opts.plugins] Kasia plugins
 * @param {Array} [opts.contentTypes] Custom content type definition objects
 * @returns {Object} Kasia reducer
 */
export default function Kasia (opts = {}) {
  const {
    WP = {},
    keyEntitiesBy = 'id',
    plugins: _plugins = [],
    contentTypes = []
  } = opts

  invariants.isWpApiInstance(WP)
  invariants.isString('keyEntitiesBy', keyEntitiesBy)
  invariants.isArray('plugins', _plugins)
  invariants.isArray('contentTypes', contentTypes)

  setWP(WP)

  const plugins = _plugins.reduce((plugins, _plugin, i) => {
    invariants.isFunction(
      'plugin at index ' + i,
      _plugin instanceof Array ? _plugin[0] : _plugin
    )

    const plugin = _plugin instanceof Array
      ? _plugin[0](WP, _plugin[1] || {}, opts)
      : _plugin(WP, {}, opts)

    return {
      sagas: plugins.sagas.concat(plugin.sagas),
      reducers: merge({}, plugins.reducers, plugin.reducers)
    }
  }, componentsBase)

  contentTypes.forEach((contentType) => registerContentType(WP, contentType))

  return {
    kasiaReducer: makeReducer({ keyEntitiesBy }, plugins),
    kasiaSagas: plugins.sagas.map((saga) => effects.spawn(saga))
  }
}
