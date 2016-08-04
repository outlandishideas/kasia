import * as effects from 'redux-saga/effects'
import { camelize } from 'humps'

import { WP } from './wpapi'
import { getContentType } from './contentTypes'
import { completeRequest, failRequest } from './actions'
import { Request, RequestTypes } from './constants/ActionTypes'

/**
 * Chain call methods beginning with `fn` that are the keys of `calls` with
 * the value of each being the argument for the corresponding invocation.
 * @param {Function} fn The function to invoke calls on
 * @param {Object} calls The methods and their args to call
 */
export function chain (fn, calls) {
  return Object.keys(calls).reduce((result, method) => {
    const args = calls[method]
    return result[method](args)
  }, fn)
}

/**
 * Create a function that dynamically calls the necessary wpapi
 * methods that will fetch data for the given content type item.
 *
 * Example returned fn for `contentType`="posts", `identifier`=16:
 * ```js
 * () => {
 *   return WP
 *     .posts()
 *     .id(16)
 *     .embed()
 *     .then((response) => response)
 * }
 * ```
 *
 * @param {Object} contentTypeMethodName The method name on wpapi instance
 * @param {String|Number} identifier The identifier's id or slug
 * @returns {Function} A function to make a request to the WP-API
 */
export function derivedQueryFn (contentTypeMethodName, identifier) {
  return () => chain(WP, {
    // Call the content type method
    [contentTypeMethodName]: null,
    // Call the identifier method
    [typeof identifier === 'string' ? 'slug' : 'id']: identifier,
    // Call 'embed' in order that embedded data is in the response
    embed: null,
    // Call `then` in order to invoke query and return a Promise
    then: (response) => response
  })
}

/**
 * Given an `action`, produce a function that will query the WP-API.
 * @param {Object} action
 * @returns {Function}
 */
export function resolveQueryFn (action) {
  const { contentType, identifier, queryFn } = action

  let realQueryFn

  if (action.request === RequestTypes.Post) {
    const options = getContentType(contentType)
    const methodName = camelize(options.plural)
    realQueryFn = derivedQueryFn(methodName, identifier)
  } else if (action.request === RequestTypes.Query) {
    realQueryFn = queryFn
  } else {
    throw new Error(`Unknown request type "${action.request}".`)
  }

  return realQueryFn
}

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch (action) {
  const { id } = action

  try {
    const result = yield effects.call(resolveQueryFn(action), WP)
    yield effects.put(completeRequest(id, result))
  } catch (err) {
    yield effects.put(failRequest(id, err))
  }
}

export function * watchRequests () {
  while (true) {
    const action = yield effects.take(Request.Create)
    yield effects.fork(fetch, action)
  }
}
