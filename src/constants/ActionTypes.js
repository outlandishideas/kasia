import ContentTypes from './ContentTypes';

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

function makeActionTypes (contentType) {
  return {
    REQUEST: {
      CREATE: `pepperoni/${contentType}/${BaseActionTypes.REQUEST.CREATE}`,
      START: `pepperoni/${contentType}/${BaseActionTypes.REQUEST.START}`,
      FAIL: `pepperoni/${contentType}/${BaseActionTypes.REQUEST.FAIL}`,
      COMPLETE: `pepperoni/${contentType}/${BaseActionTypes.REQUEST.COMPLETE}`
    },
    RECEIVE: `pepperoni/${contentType}/${BaseActionTypes.RECEIVE}`,
    INVALIDATE: `pepperoni/${contentType}/${BaseActionTypes.INVALIDATE}`
  };
}

export default {
  [ContentTypes.POST]: makeActionTypes(ContentTypes.POST),
  [ContentTypes.POST_REVISION]: makeActionTypes(ContentTypes.POST_REVISION),
  [ContentTypes.PAGE]: makeActionTypes(ContentTypes.PAGE),
  [ContentTypes.MEDIA]: makeActionTypes(ContentTypes.MEDIA),
  [ContentTypes.POST_TYPE]: makeActionTypes(ContentTypes.POST_TYPE),
  [ContentTypes.POST_STATUS]: makeActionTypes(ContentTypes.POST_STATUS),
  [ContentTypes.COMMENT]: makeActionTypes(ContentTypes.COMMENT),
  [ContentTypes.TAXONOMY]: makeActionTypes(ContentTypes.TAXONOMY),
  [ContentTypes.CATEGORY]: makeActionTypes(ContentTypes.CATEGORY),
  [ContentTypes.TAG]: makeActionTypes(ContentTypes.TAG),
  [ContentTypes.USER]: makeActionTypes(ContentTypes.USER),
  [ContentTypes.CUSTOM_CONTENT_TYPE]: makeActionTypes(ContentTypes.CUSTOM_CONTENT_TYPE)
};
