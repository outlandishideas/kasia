jest.disableAutomock();

import merge from 'lodash.merge';
import { combineReducers, createStore } from 'redux';

import pepperoni  from '../../src/index';

export default function configureStore (options) {
  const interceptReducer = jest.fn();
  const pepperoniReducer = pepperoni(merge({ wpApiUrl: 'test' }, options));

  interceptReducer.mockReturnValue({});

  const rootReducer = combineReducers({
    intercept: interceptReducer,
    ...pepperoniReducer
  });

  const store = createStore(rootReducer);
  const initialState = merge({}, store);

  return {
    interceptReducer,
    store,
    initialState
  };
}
