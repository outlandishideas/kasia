import * as effects from 'redux-saga/effects'
import { camelize } from 'humps'
import chainCall from 'chain-call'

import { getWP } from '../wpapi'
import { completeRequest, failRequest } from './actions'
import contentTypes from '../util/contentTypes'
import ActionTypes from '../constants/ActionTypes'
import OperationTypes from '../constants/OperationTypes'

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
export function deriveQueryFn (contentTypeMethodName, identifier) {
  return () => chainCall(getWP(), [
    // Call the content type method
    [contentTypeMethodName],
    // Call the identifier method
    [typeof identifier === 'string' ? 'slug' : 'id', identifier],
    // Call `embed` in order that embedded data is in the response
    ['embed'],
    // Call `then` to invoke the query for data
    ['then', (response) => response]
  ])
}

/**
 * Given an `action`, produce a function that will query the WP-API.
 * @param {Object} action
 * @returns {Function}
 */
export function makeQueryFn (action) {
  const { contentType, identifier, queryFn } = action

  let realQueryFn

  if (OperationTypes.Post === action.request) {
    const options = contentTypes.get(contentType)
    const methodName = camelize(options.plural)
    realQueryFn = deriveQueryFn(methodName, identifier)
  } else if (OperationTypes.Query === action.request) {
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
  const { target } = action

  try {
    const data = yield effects.call(makeQueryFn(action), getWP())
    yield effects.put(completeRequest({ data, target }))
  } catch (error) {
    yield effects.put(failRequest({ error, target }))
  }
}

export function * watchRequests () {
  while (true) {
    const action = yield effects.take(ActionTypes.RequestCreate)
    yield effects.fork(fetch, action)
  }
}
