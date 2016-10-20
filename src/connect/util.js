import OperationTypes from '../constants/OperationTypes'

import * as post from './util.post.js'
import * as query from './util.query.js'

module.exports = {
  [OperationTypes.Post]: post,
  [OperationTypes.Query]: query
}
