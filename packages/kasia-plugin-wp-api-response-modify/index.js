'use strict'

var ActionTypes = require('kasia/lib/constants/ActionTypes')
var modifyResponse = require('wp-api-response-modify')

/**
 * Create wp-api-response-modify plugin configuration for Kasia.
 * @param {*} _
 * @param {Array} effects Array of wp-api-response-modify effects
 * @returns {Object} Plugin configuration
 */
module.exports = function (_, effects) {
  return {
    reducers: {
      [ActionTypes.RequestComplete]: function (state, action) {
        return modifyResponse(action.data, effects)
      }
    }
  }
}
