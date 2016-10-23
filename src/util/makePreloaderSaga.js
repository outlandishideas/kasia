import { runSagas } from 'redux-saga-util'

/**
 * Make a preloader saga for all Kasia components within the `components` array.
 * Resets the libraries internal prepared query counter to zero.
 * @param {Array} components Array of components
 * @param {Object} renderProps Render props object
 * @param {Object} [state] State object
 * @returns {Function} A single saga operation
 */
export default function makePreloaderSaga (components, renderProps, state = null) {
  if (!Array.isArray(components)) {
    throw new Error(`Expecting components to be array, got "${typeof components}".`)
  } else if (!components.length) {
    throw new Error('Expecting components to be non-empty.')
  } else if (typeof renderProps !== 'object') {
    throw new Error(`Expecting renderProps to be an object, got "${typeof renderProps}".`)
  }

  const preloaders = components
    .filter(component => component && typeof component.makePreloader === 'function')
    .map(component => component.makePreloader(renderProps, state))

  return runSagas(preloaders)
}
