import ContentTypes from './constants/ContentTypes';
import WpApiEndpoints from './constants/WpApiEndpoints';
// TODO import a request lib

export function fetchContent (contentType, options) {
  // TODO make a request to wp-api as configured by consumer
}

export function fetchCategory (options) {
  return fetchContent(ContentTypes.CATEGORY, options);
}

export function fetchComment (options) {
  return fetchContent(ContentTypes.COMMENT, options);
}

export function fetchMedia (options) {
  return fetchContent(ContentTypes.MEDIA, options);
}

export function fetchPage (options) {
  return fetchContent(ContentTypes.PAGE, options);
}

export function fetchPost (options) {
  return fetchContent(ContentTypes.POST, options);
}

export function fetchPostRevision (options) {
  return fetchContent(ContentTypes.POST_REVISION, options);
}

export function fetchPostType (options) {
  return fetchContent(ContentTypes.POST_TYPE, options);
}

export function fetchPostStatus (options) {
  return fetchContent(ContentTypes.POST_STATUS, options);
}

export function fetchTag (options) {
  return fetchContent(ContentTypes.TAG, options);
}

export function fetchTaxonomy (options) {
  return fetchContent(ContentTypes.TAXONOMY, options);
}

export function fetchUser (options) {
  return fetchContent(ContentTypes.USER, options);
}

export function fetchCustomContentType (options) {
  return fetchContent(ContentTypes.CUSTOM_CONTENT_TYPE, options);
}
