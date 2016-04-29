jest.disableAutomock();

import { combineReducers, createStore } from 'redux';

import postJson from './fixtures/wp-api-responses/post'
import EntityKeyPropNames from '../src/constants/EntityKeyPropNames';
import ContentTypes from '../src/constants/ContentTypes';
import normalise from '../src/normalise';
import pepperoni from '../src/index';
import { completeRequest } from '../src/actionCreators';
import { defaultState } from '../src/reducer';

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

describe('Reduce REQUEST_COMPLETE', () => {
  it('normalises the WP-API response and places result in the store', () => {
    const normalisedData = normalise(ContentTypes.POST, postJson, EntityKeyPropNames.ID);

    store.dispatch(completeRequest(ContentTypes.POST, postJson));

    expect(store.getState().$$pepperoni.entities).toEqual(normalisedData.entities);
  });
});
