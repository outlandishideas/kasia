import ActionTypes from './constants/ActionTypes';

export function createRequest (subjectType, requestObj) {
  return Object.assign({ type: ActionTypes[subjectType].REQUEST.CREATE }, requestObj);
}

export function startRequest (subjectType, requestObj) {
  return Object.assign({ type: ActionTypes[subjectType].REQUEST.START }, requestObj);
}

export function failRequest (subjectType, requestObj) {
  return Object.assign({ type: ActionTypes[subjectType].REQUEST.FAIL }, requestObj);
}

export function completeRequest (subjectType, requestObj) {
  return Object.assign({ type: ActionTypes[subjectType].REQUEST.COMPLETE }, requestObj);
}

export function receive (subjectType, data) {
  return Object.assign({ type: ActionTypes[subjectType].RECEIVE, data });
}

export function invalidate (subjectType, id) {
  return Object.assign({ type: ActionTypes[subjectType].INVALIDATE, id });
}
