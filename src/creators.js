import ContentTypes from './constants/ContentTypes'
import { REQUEST, INVALIDATE } from './constants/ActionTypes'

// ---
// Private
// ---

export const createRequest = (contentType, subject, options = {}) =>
  ({ type: REQUEST.CREATE, contentType, subject, options })

export const startRequest = (contentType) =>
  ({ type: REQUEST.START, contentType })

export const failRequest = (contentType, error) =>
  ({ type: REQUEST.FAIL, contentType, error })

export const completeRequest = (contentType, data) =>
  ({ type: REQUEST.COMPLETE, contentType, data })

export const invalidate = (contentType, id) =>
  ({ type: INVALIDATE, contentType, id })

// ---
// Public
// ---

export const fetchCategory = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.CATEGORY,
  subject,
  options
})

export const fetchComment = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.COMMENT,
  subject,
  options
})

export const fetchMedia = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.MEDIA,
  subject,
  options
})

export const fetchPage = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.PAGE,
  subject,
  options
})

export const fetchPost = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.PAGE,
  subject,
  options
})

export const fetchPostRevision = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.POST_REVISION,
  subject,
  options
})

export const fetchPostType = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.POST_TYPE,
  subject,
  options
})

export const fetchPostStatus = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.POST_STATUS,
  subject,
  options
})

export const fetchTag = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.TAG,
  subject,
  options
})

export const fetchTaxonomy = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.TAXONOMY,
  subject,
  options
})

export const fetchUser = (subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType: ContentTypes.USER,
  subject,
  options
})

export const fetchCustomContentType = (contentType, subject, options = {}) => ({
  type: REQUEST.CREATE,
  contentType,
  options,
  subject
})
