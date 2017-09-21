import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import getWP from '../wpapi'
import { ActionTypes } from '../constants'
import { acknowledgeRequest, completeRequest, failRequest } from './actions'
import { buildQueryFunction } from '../util/query-builder'

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch (action) {
  try {
    yield put(acknowledgeRequest(action))
    const wpapi = getWP()
    const fn = action.queryFn || buildQueryFunction(action)
    const data = yield call(fn, wpapi)
    yield put(completeRequest(action.id, data))
  } catch (error) {
    yield put(failRequest(action.id, error.stack || error.message))
  }
}

/** Watch request create actions and fetch data for them. */
export function * watchRequests () {
  yield takeEvery([
    ActionTypes.RequestCreatePost,
    ActionTypes.RequestCreateQuery
  ], fetch)
}
