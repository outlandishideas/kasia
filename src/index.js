import merge from 'lodash.merge'
import map from 'lodash.map'
import zipObject from 'lodash.zipObject'
import mapKeys from 'lodash.mapKeys'
import WP from 'wpapi'

import invariants from './invariants'
import ContentTypes from './constants/ContentTypes'
import { makeReducer} from './reducer'
import { fetchSaga } from './sagas'
import { makeContentTypeOptions } from './contentTypes'

export const defaultConfig = {
  host: null,
  wpApiUrl: 'wp-json/wp/v2',
  entityKeyPropName: 'id',
  contentTypes: {},
  plugins: {}
}

let sagas = [fetchSaga]

/**
 * Configure Pepperoni.
 * @returns {Object} Pepperoni reducer
 */
export default function configurePepperoni (opts) {
  let {
    host,
    entityKeyPropName,
    contentTypes = [],
    plugins = []
  } = opts

  invariants.hostNotString(host)

  if (host[host.length - 1] === '/') {
    host = host.substr(0, host.length - 1)
  }

  // Call each plugin function with the user's own plugin
  // config and also the initial configuration for Pepperoni
  const loadedPlugins = plugins
    .map((plugin) => plugin[0](plugin[1] || {}, opts))

  // Create hash of plugin name to plugin config
  const pluginConfigs = zipObject(
    map(loadedPlugins, 'name'),
    map(loadedPlugins, 'config')
  )

  // Merge user options into default configuration
  const config = merge({}, defaultConfig, { host, entityKeyPropName })

  config.plugins = pluginConfigs
  config.wpapi = new WP({ endpoint: `${host}` })

  // Create hash of content type name to options
  config.contentTypes = merge({},
    mapKeys(ContentTypes, makeContentTypeOptions),
    zipObject(
      contentTypes.map((ct) => ct.name || ct),
      contentTypes.map(makeContentTypeOptions)
    )
  )

  if (loadedPlugins.length) {
    const pluginSagas = loadedPlugins.map((plugin) => plugin.sagas || [])
    sagas = [fetchSaga].concat(...pluginSagas)
  }

  return {
    pepperoniReducer: makeReducer(config, loadedPlugins),
    pepperoniSagas: sagas
  }
}
