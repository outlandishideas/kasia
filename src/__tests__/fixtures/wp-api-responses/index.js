import ContentTypes from '../../../constants/ContentTypes';

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
  [ContentTypes.CATEGORY]: category,
  [ContentTypes.COMMENT]: comment,
  [ContentTypes.MEDIA]: media,
  [ContentTypes.PAGE]: page,
  [ContentTypes.POST]: post,
  [ContentTypes.POST_TYPE]: postType,
  [ContentTypes.POST_STATUS]: postStatus,
  [ContentTypes.TAG]: tag,
  [ContentTypes.TAXONOMY]: taxonomy,
  [ContentTypes.USER]: user
};
