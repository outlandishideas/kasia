'use strict'

var modifyResponse = require('wp-api-response-modify')

/**
 * Create wp-api-response-modify plugin configuration for Kasia.
 * @param {WPAPI} wpapi Instance of node-wpapi
 * @param {Array} opts Plugin opts
 * @returns {Object} Plugin configuration
 */
module.exports = function (wpapi, opts) {
  var ActionTypes = opts._ActionTypes || require('kasia/lib/constants').ActionTypes
  var createCompleteReducer = opts._createCompleteReducer || require('kasia/lib/redux/reducer').createCompleteReducer
  var completeReducer

  return {
    reducers: {
      [ActionTypes.RequestComplete]: function (state, action, kasiaPluginUtils) {
        completeReducer = completeReducer || createCompleteReducer(kasiaPluginUtils.normaliseEntities)
        action.request.result = modifyResponse(action.request.result, opts.effects)
        return completeReducer(state, action)
      }
    }
  }
}
