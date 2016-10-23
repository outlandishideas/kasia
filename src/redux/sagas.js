import { takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import { completeRequest, failRequest } from './actions'
import ActionTypes from '../constants/ActionTypes'
import queryBuilder from '../util/queryBuilder'
import getWP from '../wpapi'

const WP = getWP()

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch (action) {
  try {
    const data = yield call(queryBuilder.makeQuery(WP, action))
    yield put(completeRequest(data))
  } catch (error) {
    yield put(failRequest(error))
  }
}

export function * watchRequests () {
  yield takeEvery([
    ActionTypes.RequestCreatePost,
    ActionTypes.RequestCreateQuery
  ])
}
