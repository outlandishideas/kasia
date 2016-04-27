import ContentTypes from './ContentTypes';

export const EndpointRouteParams = [
  'id',
  'postId',
  'slug'
];

export const RequestTypes = {
  SINGLE: 'SINGLE',
  PLURAL: 'PLURAL'
};

export const QueryableBySlug = [
  ContentTypes.CATEGORY,
  ContentTypes.MEDIA,
  ContentTypes.PAGE,
  ContentTypes.POST,
  ContentTypes.TAG,
  ContentTypes.USER
];

export const Slugs = {
  [ContentTypes.CATEGORY]: {
    [RequestTypes.SINGLE]: '/categories/:id',
    [RequestTypes.PLURAL]: '/categories'
  },
  [ContentTypes.COMMENT]: {
    [RequestTypes.SINGLE]: '/comments/:id',
    [RequestTypes.PLURAL]: '/comments'
  },
  [ContentTypes.MEDIA]: {
    [RequestTypes.SINGLE]: '/media/:id',
    [RequestTypes.PLURAL]: '/media'
  },
  [ContentTypes.PAGE]: {
    [RequestTypes.SINGLE]: '/pages/:id',
    [RequestTypes.PLURAL]: '/pages'
  },
  [ContentTypes.POST]: {
    [RequestTypes.SINGLE]: '/posts/:id',
    [RequestTypes.PLURAL]: '/posts'
  },
  [ContentTypes.POST_REVISION]: {
    [RequestTypes.SINGLE]: '/posts/:postId/revisions/:id',
    [RequestTypes.PLURAL]: '/posts/:postId/revisions'
  },
  [ContentTypes.POST_TYPE]: {
    [RequestTypes.SINGLE]: '/types/:id',
    [RequestTypes.PLURAL]: '/types'
  },
  [ContentTypes.POST_STATUS]: {
    [RequestTypes.SINGLE]: '/statuses/:id',
    [RequestTypes.PLURAL]: '/statuses'
  },
  [ContentTypes.TAG]: {
    [RequestTypes.SINGLE]: '/tags/:id',
    [RequestTypes.PLURAL]: '/tags'
  },
  [ContentTypes.TAXONOMY]: {
    [RequestTypes.SINGLE]: '/taxonomies/:id',
    [RequestTypes.PLURAL]: '/taxonomies'
  },
  [ContentTypes.USER]: {
    [RequestTypes.SINGLE]: '/users/:id',
    [RequestTypes.PLURAL]: '/users'
  }
};
