import merge from 'lodash.merge';

import Plurality from './constants/Plurality';
import normalise from './normalise';
import { makeBuiltInContentTypeOptions } from './contentTypes';
import { REQUEST, INVALIDATE } from './constants/ActionTypes';

export const defaultState = {
  config: {
    contentTypes: makeBuiltInContentTypeOptions()
  },
  entities: {}
};

export default function makeReducer (config) {
  defaultState.config = merge(defaultState.config, config);

  return {
    $$pepperoni: function pepperoniReducer (state = defaultState, action) {
      const [actionNamespace] = action.type.split('/');

      if (actionNamespace !== 'pepperoni') {
        return state;
      }

      const { type, contentType } = action;
      const { entityKeyPropName, contentTypes } = state.config;

      switch (type) {
        case REQUEST.COMPLETE:
          const normalisedData = normalise(contentType, action.data, entityKeyPropName);
          return merge({}, state, { entities: normalisedData.entities });

        case INVALIDATE:
          const namePlural = contentTypes[contentType].name[Plurality.PLURAL];
          delete state.entities[namePlural][action.id];
          return merge({}, state);

        default:
          return state;
      }
    }
  };
};
