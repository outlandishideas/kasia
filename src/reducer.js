import invariant from 'invariant';
import merge from 'lodash.merge';

import Plurality from './constants/Plurality';
import normalise from './normalise';
import { REQUEST, INVALIDATE } from './constants/ActionTypes';

export const baseState = {
  entities: {},
  config: {}
};

export default function makeReducer (config, plugins) {
  const { contentTypes, entityKeyPropName } = config;

  const pluginReducers = plugins
    .map(plugin => plugin.reducer || {});

  const handlers = merge({}, pluginReducers, {
    [REQUEST.COMPLETE]: (state, action) => {
      const normalisedData = normalise(action.contentType, action.data, entityKeyPropName);
      return merge({}, state, { entities: normalisedData.entities });
    },
    [INVALIDATE]: (state, action) => {
      const namePlural = contentTypes[action.contentType].name[Plurality.PLURAL];
      delete state.entities[namePlural][action.id];
      return merge({}, state);
    }
  });

  const initialState = merge({},
    baseState,
    { config }
  );

  return {
    wordpress: function pepperoniReducer (state = initialState, action) {
      const [actionNamespace] = action.type.split('/');

      if (actionNamespace !== 'pepperoni') {
        return state;
      }

      if (handlers[action.type]) {
        return handlers[action.type](state, action);
      }

      return state;
    }
  };
};
