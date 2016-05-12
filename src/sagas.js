import { takeEvery } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import invariant from 'invariant'

import fetchContent from './fetchContent'
import { REQUEST } from './constants/ActionTypes'
import { startRequest, completeRequest, failRequest } from './creators'

export const configSelector = (state) => state.wordpress.config

export function * fetchResource (action) {
  const { contentType, subject } = action

  const config = yield select(configSelector)

  const contentTypeOptions = config.contentTypes[contentType]

  invariant(
    contentTypeOptions,
    'The content type "%s" is not recognised. ' +
    'Register custom content types at initialisation.',
    contentType
  )

  yield put(startRequest(contentType))

  let { error, data } = yield call(fetchContent, contentTypeOptions, subject, config, action.options)
  if (!error && data) {
    error = data.error;
  }

  if (error) {
    yield put(failRequest(contentType, subject, error))
  } else {
    yield put(completeRequest(contentType, data))
  }
}

export default function * fetchSaga () {
  yield * takeEvery((action) => action.type === REQUEST.CREATE, fetchResource)
}
