jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import postJson from './fixtures/wp-api-responses/post'
import EntityKeyPropNames from '../constants/EntityKeyPropNames';
import ContentTypes from '../constants/ContentTypes';
import normalise from '../normalise';
import pepperoni from '../index';
import { receive } from '../actionCreators';
import { defaultState } from '../reducer';

const pepperoniReducer = pepperoni({ wpApiUrl: 'test' });
const rootReducer = combineReducers(pepperoniReducer);
const store = createStore(rootReducer);

describe('Reducer basics', () => {
  const initialStore = { $$pepperoni: defaultState };

  it('has namespaced "pepperoni" object on store', () => {
    expect(store.getState()).toEqual(initialStore);
  });

  it('does not modify store if action type is not namespaced "pepperoni"', () => {
    store.dispatch({ type: 'someOtherNamespace/' });
    expect(store.getState()).toEqual(initialStore);
  });
});

describe('Reduce RECEIVE', () => {
  it('normalises the WP-API response and places result in the store', () => {
    const normalisedData = normalise(ContentTypes.POST, postJson, EntityKeyPropNames.ID);

    store.dispatch(receive(ContentTypes.POST, postJson));

    expect(store.getState().$$pepperoni.entities).toEqual(normalisedData.entities);
  });
});
