import waitAll from './waitAll'

/**
 * Make a preloader saga for all Kasia components within the `components` array.
 * Resets the libraries internal prepared query counter to zero.
 * @param {Array} components Array of components
 * @param {Object} renderProps Render props object
 * @param {Object} [state] State object
 * @returns {Function} A single saga operation
 */
export default function makePreloaderSaga (components, renderProps, state = null) {
  if (!Array.isArray(components) || !components.length) {
    throw new Error('Expecting components to be array with at least one element.')
  } else if (typeof renderProps !== 'object') {
    throw new Error('Expecting renderProps to be an object.')
  }

  const preloaders = components
    .filter(component => component && typeof component.makePreloader === 'function')
    .map(component => component.makePreloader(renderProps, state))

  return waitAll(preloaders)
}
