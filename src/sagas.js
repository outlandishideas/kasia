import { takeEvery } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import { BaseActionTypes } from './constants/ActionTypes';
import { fetchContent } from './api';

export function* fetchResource (action) {
  const { slug, useEmbedRequestQuery } = action;

  yield put({ type: BaseActionTypes.START, slug });

  const { error, data } = yield call(fetchContent, {
    slug,
    useEmbedRequestQuery
  });

  if (error) {
    return put({ type: BaseActionTypes.FAIL, error });
  }

  return put({ type: BaseActionTypes.COMPLETE, slug, data });
}

export default function* api () {
  yield* takeEvery(BaseActionTypes.CREATE, fetchResource);
}
