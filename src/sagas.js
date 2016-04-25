import { takeEvery } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import { BaseActionTypes } from './constants/ActionTypes';
import fetchContent from './fetchContent';

import {
  startRequest,
  completeRequest,
  failRequest
} from './actionCreators';

export function* fetchResource (action) {
  const { subject } = action;
  const [, contentType] = action.type.split('/');

  const config = yield select(state => state.$$repress.config);

  yield put(startRequest(contentType));

  const { error, data } = yield call(fetchContent, contentType, subject, config, action.options);

  if (error) {
    return put(failRequest(contentType, error));
  }

  return put(completeRequest(contentType, subject, data));
}

export default function* fetchSaga () {
  yield* takeEvery(action => {
    const [,, actionType] = action.split('/');
    return actionType === BaseActionTypes.CREATE;
  }, fetchResource);
}
