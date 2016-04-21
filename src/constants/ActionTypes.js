import SubjectTypes from './SubjectTypes';

export const BaseActionTypes = {
  REQUEST: {
    CREATE: 'REQUEST_CREATE',
    START: 'REQUEST_START',
    FAIL: 'REQUEST_FAILED',
    COMPLETE: 'REQUEST_COMPLETE'
  },
  RECEIVE: 'RECEIVE',
  INVALIDATE: 'INVALIDATE'
};

function makeActionTypes (actionType) {
  return {
    REQUEST: {
      CREATE: `repress/${actionType}/${BaseActionTypes.REQUEST.CREATE}`,
      START: `repress/${actionType}/${BaseActionTypes.REQUEST.START}`,
      FAIL: `repress/${actionType}/${BaseActionTypes.REQUEST.FAIL}`,
      COMPLETE: `repress/${actionType}/${BaseActionTypes.REQUEST.COMPLETE}`
    },
    RECEIVE: `repress/${actionType}/${BaseActionTypes.RECEIVE}`,
    INVALIDATE: `repress/${actionType}/${BaseActionTypes.INVALIDATE}`
  };
}

export default {
  [SubjectTypes.POST]: makeActionTypes(SubjectTypes.POST),
  [SubjectTypes.POST_REVISION]: makeActionTypes(SubjectTypes.POST_REVISION),
  [SubjectTypes.PAGE]: makeActionTypes(SubjectTypes.PAGE),
  [SubjectTypes.MEDIA]: makeActionTypes(SubjectTypes.MEDIA),
  [SubjectTypes.POST_TYPE]: makeActionTypes(SubjectTypes.POST_TYPE),
  [SubjectTypes.POST_STATUS]: makeActionTypes(SubjectTypes.POST_STATUS),
  [SubjectTypes.COMMENT]: makeActionTypes(SubjectTypes.COMMENT),
  [SubjectTypes.TAXONOMY]: makeActionTypes(SubjectTypes.TAXONOMY),
  [SubjectTypes.CATEGORY]: makeActionTypes(SubjectTypes.CATEGORY),
  [SubjectTypes.TAG]: makeActionTypes(SubjectTypes.TAG),
  [SubjectTypes.USER]: makeActionTypes(SubjectTypes.USER)
};
