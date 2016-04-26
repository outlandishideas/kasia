jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import pepperoni from '../../index';

export default function configureStore () {
  const interceptReducer = jest.fn();

  interceptReducer.mockReturnValue({});

  const rootReducer = combineReducers({
    intercept: interceptReducer,
    ...pepperoni({ wpApiUrl: 'test' })
  });

  return {
    interceptReducer,
    store: createStore(rootReducer)
  };
}
