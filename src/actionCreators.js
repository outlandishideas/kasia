import ActionTypes from './constants/ActionTypes';

export function createRequest (contentType, requestObj) {
  return Object.assign({ type: ActionTypes[contentType].REQUEST.CREATE }, requestObj);
}

export function startRequest (contentType, requestObj) {
  return Object.assign({ type: ActionTypes[contentType].REQUEST.START }, requestObj);
}

export function failRequest (contentType, requestObj) {
  return Object.assign({ type: ActionTypes[contentType].REQUEST.FAIL }, requestObj);
}

export function completeRequest (contentType, requestObj) {
  return Object.assign({ type: ActionTypes[contentType].REQUEST.COMPLETE }, requestObj);
}

export function receive (contentType, data) {
  return Object.assign({ type: ActionTypes[contentType].RECEIVE, data });
}

export function invalidate (contentType, id) {
  return Object.assign({ type: ActionTypes[contentType].INVALIDATE, id });
}
