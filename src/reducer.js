import { mapToLowercasePlural } from './constants/SubjectTypes';
import { BaseActionTypes } from './constants/ActionTypes';
import normalisers from './normalisers';

export default function repressReducer (state = {}, action) {
  const [namespace, subjectType, actionType] = action.type.split('/');

  if (namespace !== 'repress') {
    return state;
  }

  switch (actionType) {
    case BaseActionTypes.REQUEST.START:
      // TODO implement REQUEST.START
      return state;

    case BaseActionTypes.REQUEST.FAIL:
      // TODO implement REQUEST.FAIL
      return state;

    case BaseActionTypes.REQUEST.COMPLETE:
      // TODO implement REQUEST.COMPLETE
      return state;

    case BaseActionTypes.RECEIVE:
      const nextState = Object.assign({}, state);
      const normalisedData = normalisers[subjectType](action.data);
      const collectionName = mapToLowercasePlural(subjectType);

      if (!nextState[collectionName]) {
        nextState[collectionName] = {};
      }

      return Object.assign(state, nextState, {
        [collectionName]: normalisedData.entities[collectionName]
      });

    case BaseActionTypes.INVALIDATE:
      delete state[subjectType][action.id];
      return Object.assign({}, state);

    default:
      return state;
  }
}
