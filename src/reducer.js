import merge from 'lodash.merge';

import { makeContentTypeOptions } from './contentTypes';
import { BaseActionTypes } from './constants/ActionTypes';
import normalisers from './normalisers';

export const defaultState = {
  config: {},
  entities: {}
};

export default function makeReducer (config) {
  defaultState.config = config;

  return {
    $$pepperoni: function pepperoniReducer (state = defaultState, action) {
      const [actionNamespace, contentType, actionType] = action.type.split('/');

      if (actionNamespace !== 'pepperoni') {
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
          const normalisedData = normalisers[contentType](action.data);
          return merge({}, state, { entities: normalisedData.entities });

        case BaseActionTypes.INVALIDATE:
          const contentTypeCamelCasePlural = makeContentTypeOptions(contentType);
          delete state.entities[contentTypeCamelCasePlural][action.id];
          return Object.assign({}, state);

        default:
          return state;
      }
    }
  };
};
