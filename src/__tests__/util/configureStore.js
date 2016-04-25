jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import repress from '../../index';

export default function configureStore () {
  const interceptReducer = jest.fn();

  interceptReducer.mockReturnValue({});

  const rootReducer = combineReducers({
    intercept: interceptReducer,
    ...repress({ wpApiUrl: 'test' })
  });

  return {
    interceptReducer,
    store: createStore(rootReducer)
  };
}
