import * as effects from 'redux-saga/effects'

/**
 * Make a preloader saga for all Kasia components within the `components` array.
 * @param {Array} components Array of components
 * @param {Object} renderProps Render props object
 * @returns {Function} A single saga operation
 */
export function makePreloaderSaga (components, renderProps) {
  const preloaders = components
    .filter(component => typeof component.makePreloader === 'function')
    .map(component => component.makePreloader(renderProps))
  return waitAll(preloaders)
}

/**
 * Invoke all the Kasia preloader operations defined by `sagas`
 * and produce a single saga that waits on their completion.
 * @param {Array} sagas Sagas to join
 * @returns {Function} A single saga operation
 */
function waitAll (sagas) {
  return function * () {
    const tasks = yield sagas.map(([ saga, ...params ]) => effects.fork(saga, ...params))
    yield tasks.map(effects.join)
  }
}
