import invariant from 'invariant';
import merge from 'lodash.merge';

import ActionTypes from './constants/ActionTypes';
import ContentTypes from './constants/ContentTypes';

import { customContentTypes } from './contentTypes';

// ---
// Private
// ---

export const createRequest = (contentType, subject, options = {}) =>
  ({ type: ActionTypes[contentType].REQUEST.CREATE, subject, options });

export const startRequest = (contentType) =>
  ({ type: ActionTypes[contentType].REQUEST.START });

export const failRequest = (contentType, error) =>
  ({ type: ActionTypes[contentType].REQUEST.FAIL, error });

export const completeRequest = (contentType, data) =>
  ({ type: ActionTypes[contentType].REQUEST.COMPLETE, data });

export const receive = (contentType, data) =>
  ({ type: ActionTypes[contentType].RECEIVE, data });

export const invalidate = (contentType, id) =>
  ({ type: ActionTypes[contentType].INVALIDATE, id });

// ---
// Public
// ---

export const fetchCategory = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.CATEGORY].REQUEST.CREATE, subject, options });

export const fetchComment = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.COMMENT].REQUEST.CREATE, subject, options });

export const fetchMedia = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.MEDIA].REQUEST.CREATE, subject, options });

export const fetchPage = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.PAGE].REQUEST.CREATE, subject, options });

export const fetchPost = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.POST].REQUEST.CREATE, subject, options });

export const fetchPostRevision = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.POST_REVISION].REQUEST.CREATE, subject, options });

export const fetchPostType = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.POST_TYPE].REQUEST.CREATE, subject, options });

export const fetchPostStatus = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.POST_STATUS].REQUEST.CREATE, subject, options });

export const fetchTag = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.TAG].REQUEST.CREATE, subject, options });

export const fetchTaxonomy = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.TAXONOMY].REQUEST.CREATE, subject, options });

export const fetchUser = (subject, options = {}) =>
  ({ type: ActionTypes[ContentTypes.USER].REQUEST.CREATE, subject, options });

export const fetchCustomContentType = (customContentTypeName, subject, options = {}) => {
  const customContentType = customContentTypes[customContentTypeName];

  invariant(
    customContentType,
    'The custom content type "%s" is not recognised. ' +
    'Register custom content types at initialisation or by calling Pepperoni#registerCustomContentType.',
    customContentTypeName
  );

  return {
    type: ActionTypes[ContentTypes.CUSTOM_CONTENT_TYPE],
    options: merge(options, { params: {
      slug: customContentType.requestSlug
    }}),
    subject
  };
}
