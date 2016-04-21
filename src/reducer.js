import { mapToCamelCasePlural } from './constants/ContentTypes';
import { BaseActionTypes } from './constants/ActionTypes';
import normalisers from './normalisers';

export default function repressReducer (state = {}, action) {
  const [actionNamespace, contentType, actionType] = action.type.split('/');

  if (actionNamespace !== 'repress') {
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
      const normalisedData = normalisers[contentType](action.data);
      const collectionName = mapToCamelCasePlural(contentType);

      if (!nextState[collectionName]) {
        nextState[collectionName] = {};
      }

      return Object.assign(state, nextState, {
        [collectionName]: Object.assign(
          nextState[collectionName],
          normalisedData.entities[collectionName]
        )
      });

    case BaseActionTypes.INVALIDATE:
      delete state[contentType][action.id];
      return Object.assign({}, state);

    default:
      return state;
  }
}
