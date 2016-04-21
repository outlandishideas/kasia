import SubjectTypes from '../constants/SubjectTypes';

import category from './category';
import comment from './comment';
import media from './media';
import page from './page';
import post from './post';
import postType from './postType';
import postStatus from './postStatus';
import tag from './tag';
import taxonomy from './taxonomy';
import user from './user';

export default {
  [SubjectTypes.CATEGORY]: category,
  [SubjectTypes.COMMENT]: comment,
  [SubjectTypes.MEDIA]: media,
  [SubjectTypes.PAGE]: page,
  [SubjectTypes.POST]: post,
  [SubjectTypes.POST_TYPE]: postType,
  [SubjectTypes.POST_STATUS]: postStatus,
  [SubjectTypes.TAG]: tag,
  [SubjectTypes.TAXONOMY]: taxonomy,
  [SubjectTypes.USER]: user
};
