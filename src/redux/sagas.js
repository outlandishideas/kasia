import { fork, call, take, put } from 'redux-saga/effects'
import { camelize } from 'humps'

import { completeRequest, failRequest } from './actions'
import ActionTypes from '../constants/ActionTypes'
import makeQueryFn from '../util/makeQueryFn'
import WP from '../wpapi'

/**
 * Make a fetch request to the WP-API according to the action
 * object and record the result in the store.
 * @param {Object} action Action object
 */
export function * fetch (action) {
  try {
    const data = yield call(makeQueryFn(action), WP)
    yield put(completeRequest({ data }))
  } catch (error) {
    yield put(failRequest({ error }))
  }
}

export function * watchRequests () {
  while (true) {
    const action = yield take([
      ActionTypes.RequestCreatePost,
      ActionTypes.RequestCreateQuery
    ])
    yield fork(fetch, action)
  }
}
