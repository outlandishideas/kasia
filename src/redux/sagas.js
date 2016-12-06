import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import { completeRequest, failRequest } from './actions'
import { queryBuilder } from '../util'
import ActionTypes from '../constants/ActionTypes'

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch (action) {
  try {
    const data = yield call(queryBuilder.makeQuery(action))
    yield put(completeRequest(data))
  } catch (error) {
    yield put(failRequest(error))
  }
}

export function * watchRequests () {
  yield takeEvery([
    ActionTypes.RequestCreatePost,
    ActionTypes.RequestCreateQuery
  ], fetch)
}
