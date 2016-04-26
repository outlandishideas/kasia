import merge from 'lodash.merge';

import { makeContentTypeOptions } from './contentTypes';
import { BaseActionTypes } from './constants/ActionTypes';
import normalise from './normalise';

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
      
      const { entityKeyPropName } = state.config;

      switch (actionType) {
        case BaseActionTypes.RECEIVE:
          const normalisedData = normalise(contentType, action.data, entityKeyPropName);
          return merge({}, state, { entities: normalisedData.entities });

        case BaseActionTypes.INVALIDATE:
          const contentTypeCamelCasePlural = makeContentTypeOptions(contentType);
          delete state.entities[contentTypeCamelCasePlural][action.id];
          return merge({}, state);

        default:
          return state;
      }
    }
  };
};
