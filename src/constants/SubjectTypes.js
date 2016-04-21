const SubjectTypes = {
  CATEGORY: 'CATEGORY',
  COMMENT: 'COMMENT',
  MEDIA: 'MEDIA',
  PAGE: 'PAGE',
  POST: 'POST',
  POST_REVISION: 'POST_REVISION',
  POST_TYPE: 'POST_TYPE',
  POST_STATUS: 'POST_STATUS',
  TAG: 'TAG',
  TAXONOMY: 'TAXONOMY',
  USER: 'USER'
};

export default SubjectTypes;

export function mapToLowercasePlural (subjectType) {
  return {
    [SubjectTypes.CATEGORY]: 'categories',
    [SubjectTypes.COMMENT]: 'comments',
    [SubjectTypes.MEDIA]: 'media',
    [SubjectTypes.PAGE]: 'pages',
    [SubjectTypes.POST]: 'posts',
    [SubjectTypes.POST_REVISION]: 'postRevisions',
    [SubjectTypes.POST_TYPE]: 'postTypes',
    [SubjectTypes.POST_STATUS]: 'postStatuses',
    [SubjectTypes.TAG]: 'tags',
    [SubjectTypes.TAXONOMY]: 'taxonomies',
    [SubjectTypes.USER]: 'users'
  }[subjectType];
}
