import { ContentTypes } from '../../../src/contentTypes'

import category from './category'
import comment from './comment'
import media from './media'
import page from './page'
import post from './post'
import postType from './postType'
import postStatus from './postStatus'
import tag from './tag'
import taxonomy from './taxonomy'
import user from './user'

export default {
  [ContentTypes.Category]: category,
  [ContentTypes.Comment]: comment,
  [ContentTypes.Media]: media,
  [ContentTypes.Page]: page,
  [ContentTypes.Single]: post,
  [ContentTypes.PostType]: postType,
  [ContentTypes.PostStatus]: postStatus,
  [ContentTypes.Tag]: tag,
  [ContentTypes.Taxonomy]: taxonomy,
  [ContentTypes.User]: user
}
