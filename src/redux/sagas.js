import { takeEvery, select, call, put } from 'redux-saga/effects'

import getWP from '../wpapi'
import { ActionTypes } from '../constants'
import { acknowledgeRequest, completeRequest, failRequest } from './actions'
import { buildQueryFunction } from '../util/query-builder'

export function _getCurrentQueryId (state) {
  return state.wordpress.__nextQueryId
}

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch ({ request }) {
  try {
    request.id = yield select(_getCurrentQueryId)
    yield put(acknowledgeRequest(request))
    const wpapi = getWP()
    const fn = request.queryFn || buildQueryFunction(request)
    const data = yield call(fn, wpapi)
    yield put(completeRequest(request.id, data))
  } catch (error) {
    yield put(failRequest(request.id, error.stack || error.message))
  }
}

/** Watch request create actions and fetch data for them. */
export function * watchRequests () {
  yield takeEvery([
    ActionTypes.RequestCreatePost,
    ActionTypes.RequestCreateQuery
  ], fetch)
}
