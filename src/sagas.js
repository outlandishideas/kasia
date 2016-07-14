import { takeEvery } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'

import fetchContent from './fetchContent'
import invariants from './invariants'
import { startRequest, completeRequest, failRequest } from './creators'
import { REQUEST } from './constants/ActionTypes'

export const configSelector = (contentType, state) => state.wordpress.config

export function * fetchResource (action) {
  const { contentType, subject } = action

  const config = yield select(configSelector, contentType)
  const contentTypeOptions = config.contentTypes[contentType]

  invariants.badContentType(contentType, contentTypeOptions)

  yield put(startRequest(contentType))

  let { error, data } = yield call(fetchContent,
    contentTypeOptions,
    subject,
    config,
    action.options)

  if (!error && data) {
    error = data.error;
  }

  return error
    ? yield put(failRequest(contentType, subject, error))
    : yield put(completeRequest(contentType, data))
}

export function * fetchSaga () {
  yield * takeEvery((action) => action.type === REQUEST.CREATE, fetchResource)
}
