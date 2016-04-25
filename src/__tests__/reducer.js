jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import postJson from './fixtures/wp-api-responses/post'
import ContentTypes from '../constants/ContentTypes';
import normalisers from '../normalisers';
import repress from '../index';
import { receive } from '../actionCreators';
import { defaultState } from '../reducer';

const repressReducer = repress({ wpApiUrl: 'test' });
const rootReducer = combineReducers(repressReducer);
const store = createStore(rootReducer);

describe('Reducer basics', () => {
  const initialStore = { $$repress: defaultState };

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

    store.dispatch(receive(ContentTypes.POST, postJson));

    expect(store.getState().$$repress.entities).toEqual(normalisedData.entities);
  });
});
