import { fork, join } from 'redux-saga/effects'

import { fetch } from '../redux/sagas'
import { createPostRequest, createQueryRequest } from '../redux/actions'
import { contentTypesManager, invariants } from '../util'

const preloaders = {}

export default preloaders

/**
 * Make a preloader saga for all Kasia components within the `components` array.
 * Resets the libraries internal prepared query counter to zero.
 * @param {Object} store Redux store enhanced with `runSaga`
 * @param {Array} components Array of components
 * @param {Object} renderProps Render props object
 * @param {Object} [state] State object
 * @returns {Function} A single saga operation
 */
preloaders.preload = function preloadersPreload (store, components, renderProps, state = null) {
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

  return function * () {
    const tasks = yield preloaders.map(([ fn, action ]) => fork(fn, action))
    yield tasks.map(join)
  }
}

/**
 * Make a preloader saga that fetches a single entity.
 * @param {String} contentType Post content type
 * @param {String|Number|Function} id Post identifier
 * @param {Object} renderProps Render props object
 * @returns {Function} A single saga operation
 */
preloaders.preloadPost = function preloadersPreloadPost (contentType, id, renderProps) {
  if (typeof contentType !== 'string') {
    throw new Error(`Expecting contentType to be a string, got "${typeof contentType}".`)
  } else if (typeof id !== 'string' && typeof id !== 'number' && typeof id !== 'function') {
    throw new Error(`Expecting id to be a string, number, or function, got "${typeof id}"`)
  }

  const identifier = typeof id === 'function' ? id(renderProps) : id
  const action = createPostRequest({ contentType, identifier })

  invariants.isValidContentType(contentTypesManager.get(contentType), contentType, 'call to makePostPreloaderSaga')
  invariants.isIdentifierValue(identifier)

  return function * () {
    yield fork(fetch, action)
  }
}

/**
 * Make a preloader saga that fetches data for an arbitrary WP API query.
 * @param {Function} queryFn Query function that accepts `wpapi` API
 * @param {Object} renderProps Render props object
 * @param {Boolean} [state] State object
 * @returns {Function} A single saga operation
 */
preloaders.preloadQuery = function preloadersPreloadQuery (queryFn, renderProps, state = null) {
  if (typeof queryFn !== 'function') {
    throw new Error(`Expecting queryFn to be a function, got "${queryFn}"`)
  } else if (typeof renderProps !== 'object') {
    throw new Error(`Expecting renderProps to be an object, got "${typeof renderProps}".`)
  }

  const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
  const action = createQueryRequest({ queryFn: realQueryFn })

  return function * () {
    yield fork(fetch, action)
  }
}
