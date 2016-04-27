import merge from 'lodash.merge';

import { makeContentTypeOptions } from './contentTypes';
import { RECEIVE, INVALIDATE, REGISTER_CUSTOM_CONTENT_TYPE } from './constants/ActionTypes';
import { RequestTypes } from './constants/WpApiEndpoints';
import normalise from './normalise';

export const defaultState = {
  config: {
    contentTypes: makeContentTypeOptions()
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
        case RECEIVE:
          const normalisedData = normalise(contentType, action.data, entityKeyPropName);
          return merge({}, state, { entities: normalisedData.entities });

        case INVALIDATE:
          const namePlural = contentTypes[contentType].name[RequestTypes.PLURAL];
          delete state.entities[namePlural][action.id];
          return merge({}, state);

        default:
          return state;
      }
    }
  };
};
