import Plurality from './Plurality';
import ContentTypes from './ContentTypes';

export const EndpointRouteParams = [
  'id',
  'postId',
  'slug'
];

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
    [Plurality.SINGULAR]: '/categories/:id',
    [Plurality.PLURAL]: '/categories'
  },
  [ContentTypes.COMMENT]: {
    [Plurality.SINGULAR]: '/comments/:id',
    [Plurality.PLURAL]: '/comments'
  },
  [ContentTypes.MEDIA]: {
    [Plurality.SINGULAR]: '/media/:id',
    [Plurality.PLURAL]: '/media'
  },
  [ContentTypes.PAGE]: {
    [Plurality.SINGULAR]: '/pages/:id',
    [Plurality.PLURAL]: '/pages'
  },
  [ContentTypes.POST]: {
    [Plurality.SINGULAR]: '/posts/:id',
    [Plurality.PLURAL]: '/posts'
  },
  [ContentTypes.POST_REVISION]: {
    [Plurality.SINGULAR]: '/posts/:postId/revisions/:id',
    [Plurality.PLURAL]: '/posts/:postId/revisions'
  },
  [ContentTypes.POST_TYPE]: {
    [Plurality.SINGULAR]: '/types/:id',
    [Plurality.PLURAL]: '/types'
  },
  [ContentTypes.POST_STATUS]: {
    [Plurality.SINGULAR]: '/statuses/:id',
    [Plurality.PLURAL]: '/statuses'
  },
  [ContentTypes.TAG]: {
    [Plurality.SINGULAR]: '/tags/:id',
    [Plurality.PLURAL]: '/tags'
  },
  [ContentTypes.TAXONOMY]: {
    [Plurality.SINGULAR]: '/taxonomies/:id',
    [Plurality.PLURAL]: '/taxonomies'
  },
  [ContentTypes.USER]: {
    [Plurality.SINGULAR]: '/users/:id',
    [Plurality.PLURAL]: '/users'
  }
};
