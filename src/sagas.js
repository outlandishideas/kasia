import { takeEvery } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';
import invariant from 'invariant';

import fetchContent from './fetchContent';
import { REQUEST } from './constants/ActionTypes';
import { findContentTypeOptions } from './contentTypes';
import { startRequest, completeRequest, failRequest } from './actionCreators';

export const configSelector = state => state.$$pepperoni.config;

export function* fetchResource (action) {
  const { contentType, subject } = action;

  const config = yield select(configSelector);

  const contentTypeOptions = findContentTypeOptions(contentType, config.contentTypes);

  invariant(
    contentTypeOptions,
    'The content type "%s" is not recognised. ' +
    'Register custom content types at initialisation.',
    action.subject
  );

  yield put(startRequest(contentType));

  const { error, data } = yield call(fetchContent, contentType, subject, config, action.options);

  if (error) {
    return put(failRequest(contentType, error));
  }

  return put(completeRequest(contentType, subject, data));
}

export default function* fetchSaga () {
  yield* takeEvery(action => action.type === REQUEST.CREATE, fetchResource);
}
