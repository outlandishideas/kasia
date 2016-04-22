jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import repressReducer from '../../reducer';

export default function configureStore () {
  const interceptReducer = jest.fn();

  interceptReducer.mockReturnValue({});

  const rootReducer = combineReducers({
    intercept: interceptReducer,
    ...repressReducer
  });

  return {
    interceptReducer,
    store: createStore(rootReducer, {})
  };
}
