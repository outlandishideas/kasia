import * as effects from 'redux-saga/effects'

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
