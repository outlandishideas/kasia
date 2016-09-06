import * as effects from 'redux-saga/effects'

import { resetPreparedQueryId } from './connect/util'

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

/**
 * Make a preloader saga for all Kasia components within the `components` array.
 * Resets the libraries internal prepared query counter to zero.
 * @param {Array} components Array of components
 * @param {Object} renderProps Render props object
 * @param {Boolean} [resetPreparedQueryCounter] Reset the prepared query counter
 * @returns {Function} A single saga operation
 */
export function makePreloaderSaga (components, renderProps, resetPreparedQueryCounter = true) {
  if (resetPreparedQueryCounter) {
    resetPreparedQueryId()
  }

  const preloaders = components
    .filter(component => component && typeof component.makePreloader === 'function')
    .map(component => component.makePreloader(renderProps))

  return waitAll(preloaders)
}
