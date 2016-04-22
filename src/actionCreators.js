import ActionTypes from './constants/ActionTypes';

export function createRequest (contentType, options) {
  return { type: ActionTypes[contentType].REQUEST.CREATE, options };
}

export function startRequest (contentType, options) {
  return { type: ActionTypes[contentType].REQUEST.START, options };
}

export function failRequest (contentType, options) {
  return { type: ActionTypes[contentType].REQUEST.FAIL, options };
}

export function completeRequest (contentType, options) {
  return { type: ActionTypes[contentType].REQUEST.COMPLETE, options };
}

export function receive (contentType, data) {
  return { type: ActionTypes[contentType].RECEIVE, data };
}

export function invalidate (contentType, id) {
  return { type: ActionTypes[contentType].INVALIDATE, id };
}
