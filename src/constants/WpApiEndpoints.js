import SubjectTypes from './SubjectTypes';

export default {
  [SubjectTypes.CATEGORY]: {
    PLURAL: '/categories',
    SINGLE: '/categories/:id'
  },
  [SubjectTypes.COMMENT]: {
    SINGLE: '/comments/:id',
    PLURAL: '/comments'
  },
  [SubjectTypes.MEDIA]: {
    SINGLE: '/media/:id',
    PLURAL: '/media'
  },
  [SubjectTypes.PAGE]: {
    SINGLE: '/pages/:id',
    PLURAL: '/pages'
  },
  [SubjectTypes.POST]: {
    SINGLE: '/posts/:id',
    PLURAL: '/posts'
  },
  [SubjectTypes.POST_REVISION]: {
    SINGLE: '/:postId/revisions/:id',
    PLURAL: '/:postId/revisions'
  },
  [SubjectTypes.POST_TYPE]: {
    SINGLE: '/types/:id',
    PLURAL: '/types'
  },
  [SubjectTypes.POST_STATUS]: {
    SINGLE: '/statuses/:id',
    PLURAL: '/statuses'
  },
  [SubjectTypes.TAG]: {
    SINGLE: '/tags/:id',
    PLURAL: '/tags'
  },
  [SubjectTypes.TAXONOMY]: {
    SINGLE: '/taxonomies/:id',
    PLURAL: '/taxonomies'
  },
  [SubjectTypes.USER]: {
    SINGLE: '/users/:id',
    PLURAL: '/users'
  }
};
