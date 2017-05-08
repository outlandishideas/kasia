import { put, join, fork } from 'redux-saga/effects'

import { completeRequest } from '../redux/actions'

/** Make a preloader saga for all Kasia components within the `components` array. */
export function preload (components, renderProps = {}, state = {}) {
  if (!Array.isArray(components)) {
    throw new Error(`Expecting components to be array, got "${typeof components}".`)
  } else if (typeof renderProps !== 'object') {
    throw new Error(`Expecting renderProps to be an object, got "${typeof renderProps}".`)
  } else if (typeof state !== 'object') {
    throw new Error(`Expecting state to be an object, got "${typeof state}".`)
  }

  return function * () {
    const tasks = yield components
      .map((c) => c && typeof c.preload === 'function' ? c : false)
      .filter(Boolean)
      .map((component) => component.preload(renderProps, state))
      .map(([ fn, action ]) => fork(fn, action))

    if (tasks.length) {
      yield join(...tasks)
    }
  }
}

/** Make a preloader saga that fetches data for an arbitrary WP API query. */
export function preloadQuery (queryFn, renderProps = {}, state = {}) {
  if (typeof queryFn !== 'function') {
    throw new Error(`Expecting queryFn to be a function, got "${queryFn}".`)
  } else if (typeof renderProps !== 'object') {
    throw new Error(`Expecting renderProps to be an object, got "${typeof renderProps}".`)
  } else if (typeof state !== 'object') {
    throw new Error(`Expecting state to be an object, got "${typeof state}".`)
  }

  return function * () {
    const data = yield queryFn(renderProps, state)
    yield put(completeRequest(null, data))
  }
}
