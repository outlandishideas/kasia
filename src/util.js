import * as effects from 'redux-saga/effects'

import { fetch } from './sagas'
import { createPostRequest, createQueryRequest } from './actions'
import { getContentType } from './contentTypes'
import invariants from './invariants'

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
 * @param {Object} [state] State object
 * @returns {Function} A single saga operation
 */
export function makePreloaderSaga (components, renderProps, state = null) {
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

/**
 * Make a preloader saga for an arbitrary WP API query.
 * @param {Function} queryFn Query function that accepts `wpapi` API
 * @param {Object} renderProps Render props object
 * @param {Boolean} [state] State object
 * @returns {Function} A single saga operation
 */
export function makeQueryPreloaderSaga (queryFn, renderProps, state = null) {
  if (typeof queryFn !== 'function') {
    throw new Error('Expecting queryFn to be a function.')
  }

  const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
  const action = createQueryRequest({ queryFn: realQueryFn })

  return function * () {
    yield effects.fork(fetch, action)
  }
}

/**
 * Make a preloader saga for single content type item.
 * @param {String} contentType Post content type
 * @param {String|Number|Function} id Post identifier
 * @param {Object} renderProps Render props object
 * @returns {Function} A single saga operation
 */
export function makePostPreloaderSaga (contentType, id, renderProps) {
  if (typeof contentType !== 'string') {
    throw new Error('Expecting contentType to be a string.')
  } else if (typeof id !== 'string' && typeof id !== 'number' && typeof id !== 'function') {
    throw new Error('Expecting identifier to be a string, number, or function.')
  }

  const identifier = typeof id === 'function' ? id(renderProps) : id
  const action = createPostRequest({ contentType, identifier })

  invariants.isValidContentType(getContentType(contentType), contentType, 'call to makePostPreloaderSaga')
  invariants.isIdentifierValue(identifier)

  return function * () {
    yield effects.fork(fetch, action)
  }
}
