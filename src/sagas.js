import { takeEvery } from 'redux-saga';
import { call, put, select } from 'redux-saga/effects';

import ActionTypes, { BaseActionTypes } from './constants/ActionTypes';
import fetchContent from './fetchContent';

export function* fetchResource (action) {
  const { subject } = action;
  const [, contentType] = action.type.split('/');
  const requestActions = ActionTypes[contentType].REQUEST;

  const config = yield select(state => state.$$repress.config);

  yield put({ type: requestActions.START });

  const { error, data } = yield call(fetchContent, contentType, subject, config, action.options);

  if (error) {
    return put({ type: requestActions.FAIL, error });
  }

  return put({ type: requestActions.COMPLETE, subject, data });
}

export default function* fetchSaga () {
  yield* takeEvery(action => {
    const [,, actionType] = action.split('/');
    return actionType === BaseActionTypes.CREATE;
  }, fetchResource);
}
