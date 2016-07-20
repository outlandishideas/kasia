import { camelize } from 'humps'

import invariants from './invariants'
import makeReducer from './reducer'
import { WP } from './wpapi'
import { fetchSaga } from './sagas'
import { registerContentType, getContentTypes } from './contentTypes'

/**
 * Internal Pepperoni sagas.
 * Extended with plugin sagas if available.
 * @type {Array}
 */
let sagas = [fetchSaga]

/**
 * Configure Pepperoni.
 * @param {String} `opts.host` Host of the WordPress installation
 * @param {String} `opts.entityKeyPropName` Property of an entity that is used to key it on the store
 * @param {Array} `opts.plugins` Array of Pepperoni plugins
 * @param {Array} `opts.contentTypes` Array of custom content type definition objects
 * @returns {Object} Pepperoni reducer
 */
export default function configurePepperoni (opts = {}) {
  const {
    host,
    entityKeyPropName = 'id',
    plugins = [],
    contentTypes = []
  } = opts

  invariants.isString(host, 'host')
  invariants.isString(entityKeyPropName, 'entityKeyPropName')
  invariants.isArray(plugins, 'plugins')
  invariants.isArray(contentTypes, 'contentTypes')

  const api = WP({ endpoint: host + '/wp-json' })

  const pluginReducers = plugins
    .map((plugin) => {
      invariants.isFunction(plugin[0])
      const pluginOptions = plugin[0](plugin[1] || {}, opts)
      sagas = sagas.concat(plugin.sagas || [])
      return pluginOptions
    })
    .map((p) => p.reducer || {})

  contentTypes.forEach((contentType, i) => {
    invariants.isValidContentTypeObject(contentType, i)
    invariants.isNewContentType(getContentTypes(), contentType)
    const plural = contentType.plural
    api[camelize(plural)] = api.registerRoute('/wp/v2', `/${plural}(?P<id>)`)
    registerContentType(contentType)
  })

  return {
    api,
    pepperoniReducer: makeReducer({ entityKeyPropName }, pluginReducers),
    pepperoniSagas: sagas
  }
}
