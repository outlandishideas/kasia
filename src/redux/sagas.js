import { takeEvery, select, call, put } from 'redux-saga/effects'

import getWP from '../wpapi'
import { ActionTypes } from '../constants'
import { acknowledgeRequest, completeRequest, failRequest } from './actions'
import { buildQueryFunction } from '../util/query-builder'

export function _getLastQueryId (state) {
  return state.wordpress.__nextQueryId - 1
}

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch (action) {
  try {
    yield put(acknowledgeRequest(action))
    var actionId = yield select(_getLastQueryId)
    const wpapi = getWP()
    const fn = action.queryFn || buildQueryFunction(action)
    const data = yield call(fn, wpapi)
    yield put(completeRequest(actionId, data))
  } catch (error) {
    yield put(failRequest(actionId, error.stack || error.message))
  }
}

/** Watch request create actions and fetch data for them. */
export function * watchRequests () {
  yield takeEvery([
    ActionTypes.RequestCreatePost,
    ActionTypes.RequestCreateQuery
  ], fetch)
}
