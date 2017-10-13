/**
 * Run all `sagas` until they are complete.
 * @param {Object} store Enhanced redux store with `runSaga` method
 * @param {Array} sagas Array of saga operations
 * @returns {Promise}
 */
export default function runSagas (store, sagas) {
  if (typeof store !== 'object' || typeof store.runSaga !== 'function') {
    throw new Error('Expecting store to be redux store with runSaga enhancer method.')
  }

  return sagas.reduce((promise, getSaga) => {
    return promise.then(() => {
      const state = store.getState()
      return store.runSaga(getSaga(state)).done
    })
  }, Promise.resolve())
}
