jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import postJson from './fixtures/wp-api-responses/post'
import ContentTypes from '../constants/ContentTypes';
import repressReducer from '../reducer';
import normalisers from '../normalisers';
import { receive } from '../actionCreators';

const rootReducer = combineReducers(repressReducer);
const store = createStore(rootReducer, {});

describe('Reducer basics', () => {
  const initialStore = { $$repress: {} };

  it('has namespaced "repress" object on store', () => {
    expect(store.getState()).toEqual(initialStore);
  });

  it('does not modify store if action type is not namespaced "repress"', () => {
    store.dispatch({ type: 'someOtherNamespace/' });
    expect(store.getState()).toEqual(initialStore);
  });
});

describe('Reduce RECEIVE', () => {
  it('normalises the WP-API response and places result in the store', () => {
    const normalisedData = normalisers[ContentTypes.POST](postJson);

    store.dispatch(
      receive(ContentTypes.POST, postJson)
    );

    expect(store.getState()).toEqual({
      $$repress: normalisedData.entities
    });
  });
});
