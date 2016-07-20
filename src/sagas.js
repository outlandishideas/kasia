import { takeEvery, takeLatest } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { camelize } from 'humps'

import { wpapi } from './wpapi'
import { getContentType } from './contentTypes'
import { putRequest, completeRequest, failRequest } from './actions'
import { REQUEST, REQUEST_TYPES } from './ActionTypes'

/**
 * Create a function that dynamically calls the necessary wpapi
 * methods that will fetch data for the given arguments.
 *
 * The resultant will look like:
 * ```js
 * () => wpapi.{contentType}().{id,slug}(<identifier>).embed().then(<handler>)
 * ```
 *
 * Example result:
 * ```js
 * () => wpapi.posts().id(16).embed().then((response) => response)
 * ```
 *
 * @param {Object} contentTypeOptions The content type's options object
 * @param {String|Number} identifier The identifier's id or slug
 * @returns {Function}
 */
function derivedQuery (contentTypeOptions, identifier) {
  const methodChain = [
    // Call the content type method
    [camelize(contentTypeOptions.plural)],
    // Call the identifier method
    [typeof identifier === 'string' ? 'slug' : 'id', identifier],
    // Call 'embed' in order that embedded data is in the response
    ['embed'],
    // Call `then` in order to invoke query and return a Promise
    ['then', (response) => response]
  ]

  return () => methodChain.reduce((result, next) => {
    const arg = next[1] || undefined
    return result[next[0]](arg)
  }, wpapi)
}

export function * fetch (action) {
  const { id } = action
  const { contentType, identifier } = action.options

  yield put(putRequest(id, contentType))

  const contentTypeOptions = getContentType(contentType)

  const queryFn = action.requestType === REQUEST_TYPES.Single
    ? derivedQuery(contentTypeOptions, identifier)
    : action.queryFn

  try {
    let result = yield call(queryFn)
    yield put(completeRequest(id, result))
  } catch (err) {
    yield put(failRequest(id, err))
  }
}

export function * fetchSaga () {
  yield * takeEvery((action) => action.type === REQUEST.Create, fetch)
}
