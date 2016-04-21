import ContentTypes from './ContentTypes';

export default {
  [ContentTypes.CATEGORY]: {
    PLURAL: '/categories',
    SINGLE: '/categories/:id'
  },
  [ContentTypes.COMMENT]: {
    SINGLE: '/comments/:id',
    PLURAL: '/comments'
  },
  [ContentTypes.MEDIA]: {
    SINGLE: '/media/:id',
    PLURAL: '/media'
  },
  [ContentTypes.PAGE]: {
    SINGLE: '/pages/:id',
    PLURAL: '/pages'
  },
  [ContentTypes.POST]: {
    SINGLE: '/posts/:id',
    PLURAL: '/posts'
  },
  [ContentTypes.POST_REVISION]: {
    SINGLE: '/:postId/revisions/:id',
    PLURAL: '/:postId/revisions'
  },
  [ContentTypes.POST_TYPE]: {
    SINGLE: '/types/:id',
    PLURAL: '/types'
  },
  [ContentTypes.POST_STATUS]: {
    SINGLE: '/statuses/:id',
    PLURAL: '/statuses'
  },
  [ContentTypes.TAG]: {
    SINGLE: '/tags/:id',
    PLURAL: '/tags'
  },
  [ContentTypes.TAXONOMY]: {
    SINGLE: '/taxonomies/:id',
    PLURAL: '/taxonomies'
  },
  [ContentTypes.USER]: {
    SINGLE: '/users/:id',
    PLURAL: '/users'
  }
};
