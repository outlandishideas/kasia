import merge from 'lodash.merge'
import invariant from 'invariant'

import makeReducer from './reducer'
import fetchSaga from './sagas'
import { builtInContentTypeOptions, makeCustomContentTypeOptions } from './contentTypes'

export { default as ContentTypes } from './constants/ContentTypes'

export const __defaultConfig = {
  host: null,
  wpApiUrl: 'wp-json/wp/v2',
  entityKeyPropName: 'id',
  contentTypes: builtInContentTypeOptions,
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

  invariant(
    typeof host === 'string',
    'Expecting host to be a string, got "%s".',
    typeof host
  )

  // Call each plugin function with the user's own plugin
  // config and also the initial configuration for Pepperoni
  const loadedPlugins = plugins
    .map((plugin) => plugin[0](plugin[1] || {}, opts))

  const pluginConfigs = loadedPlugins
    .reduce((obj, plugin) => {
      obj[plugin.name] = plugin.config
      return obj
    }, {})

  const config = merge({},
    __defaultConfig,
    { host, entityKeyPropName },
    { plugins: pluginConfigs }
  )

  config.contentTypes = merge({},
    config.contentTypes,
    makeCustomContentTypeOptions(contentTypes)
  )

  if (loadedPlugins.length) {
    const pluginSagas = loadedPlugins
      .map((plugin) => plugin.sagas || [])

    sagas = [fetchSaga].concat(...pluginSagas)
  }

  return {
    pepperoniReducer: makeReducer(config, loadedPlugins),
    pepperoniSagas: sagas
  }
}
