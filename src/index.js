import merge from 'lodash.merge'
import map from 'lodash.map'
import zipObject from 'lodash.zipObject'
import mapKeys from 'lodash.mapKeys'

import invariants from './invariants'
import ContentTypes from './constants/ContentTypes'
import { makeReducer} from './reducer'
import { fetchSaga } from './sagas'
import { makeContentTypeOptions } from './contentTypes'

export const __defaultConfig = {
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
  const {
    host,
    entityKeyPropName,
    contentTypes = [],
    plugins = []
  } = opts

  invariants.hostNotString(host)

  // Call each plugin function with the user's own plugin
  // config and also the initial configuration for Pepperoni
  const loadedPlugins = plugins
    .map((plugin) => plugin[0](plugin[1] || {}, opts))

  // Create hash of plugin name to plugin config
  const pluginConfigs = zipObject(
    map(loadedPlugins, 'name'),
    map(loadedPlugins, 'config'))

  // Merge user options into default configuration
  const config = merge({},
    __defaultConfig,
    { host, entityKeyPropName },
    { plugins: pluginConfigs })

  // Create hash of content type name to options
  config.contentTypes = merge({},
    mapKeys(ContentTypes, makeContentTypeOptions),
    zipObject(
      contentTypes.map((ct) => ct.name || ct),
      contentTypes.map(makeContentTypeOptions)))

  if (loadedPlugins.length) {
    const pluginSagas = loadedPlugins.map((plugin) => plugin.sagas || [])
    sagas = [fetchSaga].concat(...pluginSagas)
  }

  return {
    pepperoniReducer: makeReducer(config, loadedPlugins),
    pepperoniSagas: sagas
  }
}
