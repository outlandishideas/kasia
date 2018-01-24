import { takeEvery, select, call, put } from 'redux-saga/effects'
import isNode from 'is-node-fn'

import getWP from '../wpapi'
import { ActionTypes } from '../constants'
import { acknowledgeRequest, completeRequest, failRequest } from './actions'
import { buildQueryFunction } from '../util/query-builder'

const requestCache = {}

export function _getCurrentQueryId (state) {
  return state.wordpress.__nextQueryId
}

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {String} type Action type
 * @param {Object} request Request object
 */
export function * fetch ({ type, request }) {
  try {
    const { cacheStrategy } = request
    let data, fromCache

    if (isNode()) {
      // we get here via the component preloaders
      request.id = yield select(_getCurrentQueryId)
    }

    if (!isNode() && cacheStrategy) {
      if (cacheStrategy.expires > 0 && !cacheStrategy.invalidate) {
        const cacheEntry = requestCache[cacheStrategy.cacheId]

        if (cacheEntry) {
          if (cacheEntry.expires < Date.now()) {
            data = cacheEntry.data
            fromCache = true
          } else {
            requestCache[cacheStrategy.cacheId] = null
          }
        }
      } else if (cacheStrategy.invalidate) {
        requestCache[cacheStrategy.cacheId] = null
      }
    }

    if (!data) {
      yield put(acknowledgeRequest(request))

      const wpapi = getWP()
      let fn

      if (type === ActionTypes.RequestCreateQuery) {
        fn = request.queryFn
      } else if (type === ActionTypes.RequestCreatePost) {
        fn = buildQueryFunction(request)
      } else {
        throw new Error(`unknown action type ${type}`)
      }

      data = yield call(fn, wpapi)

      if (!isNode() && cacheStrategy) {
        requestCache[cacheStrategy.cacheId] = data
      }
    }

    yield put(completeRequest({
      id: request.id,
      result: data,
      fromCache
    }))
  } catch (error) {
    yield put(failRequest({
      id: request.id,
      error: error.stack || error.message
    }))
  }
}

/** Watch request create actions and fetch data for them. */
export function * watchRequests () {
  yield takeEvery([
    ActionTypes.RequestCreatePost,
    ActionTypes.RequestCreateQuery
  ], fetch)
}
