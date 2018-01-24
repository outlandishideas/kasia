import { put, join, fork } from 'redux-saga/effects'

import { completeRequest } from '../redux/actions'
import { PreloadQueryId } from '../constants'

/**
 * Run all `preloaders` until they are complete.
 * @param {Array} preloaders Array of preloader fns that return sagas
 * @param {Object} store Enhanced redux store with `runSaga` method
 * @param {*} props
 * @returns {Promise}
 */
export function runPreloaders (preloaders, store, props) {
  if (typeof store !== 'object' || typeof store.runSaga !== 'function') {
    throw new Error('Expecting store to be redux store with runSaga enhancer method.')
  }

  return preloaders.reduce((promise, val) => {
    return promise.then(() => {
      const state = store.getState()
      return store.runSaga(val(state, props)).done
    })
  }, Promise.resolve())
}

/** Make a preloader saga creator for all Kasia components within the `components` array. */
export function preloadComponents (components, renderProps = {}, state = {}, req = null, res = null) {
  if (!Array.isArray(components)) {
    throw new Error(`Expecting components to be array, got "${typeof components}".`)
  } else if (typeof renderProps !== 'object') {
    throw new Error(`Expecting renderProps to be an object, got "${typeof renderProps}".`)
  } else if (typeof state !== 'object') {
    throw new Error(`Expecting state to be an object, got "${typeof state}".`)
  }

  return function (state) {
    return function * () {
      const tasks = yield components
        .map((c) => c && typeof c.preload === 'function' ? c : false)
        .filter((c) => !!c)
        .map((component) => component.preload(renderProps, state, req, res))
        .map(([ fn, action ]) => fork(fn, action))

      if (tasks.length) {
        yield join(...tasks)
      }
    }
  }
}

/** Make a preloader saga creator that fetches data for an arbitrary WP API query. */
export function preloadQuery (queryFn, renderProps = {}, state = {}, req = null, res = null) {
  if (typeof queryFn !== 'function') {
    throw new Error(`Expecting queryFn to be a function, got "${queryFn}".`)
  } else if (typeof renderProps !== 'object') {
    throw new Error(`Expecting renderProps to be an object, got "${typeof renderProps}".`)
  } else if (typeof state !== 'object') {
    throw new Error(`Expecting state to be an object, got "${typeof state}".`)
  }

  return function (state) {
    return function * () {
      const data = yield queryFn(renderProps, state, req, res)
      const action = completeRequest({
        id: PreloadQueryId,
        result: data
      })
      yield put(action)
    }
  }
}
