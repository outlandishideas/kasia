jest.unmock('redux')
jest.unmock('redux-saga')
jest.unmock('normalizr')

jest.unmock('../constants/SubjectTypes');
jest.unmock('../reducer');
jest.unmock('../normalisers/index');
jest.unmock('../normalisers/post');
jest.unmock('../actionCreators');

import { combineReducers, createStore } from 'redux';

import postJson from './fixtures/wp-api-responses/post'

import SubjectTypes from '../constants/SubjectTypes';
import repressReducer from '../reducer';
import normalisers from '../normalisers';
import { receive } from '../actionCreators';

const rootReducer = combineReducers({
  repress: repressReducer
});

let store = createStore(rootReducer, {});

describe('Repress reducer', () => {
  const initialStore = { repress: {} };

  it('has namespaced "repress" object on store', () => {
    expect(store.getState()).toEqual(initialStore);
  });

  it('does not modify store if action type is not namespaced "repress"', () => {
    store.dispatch({ type: 'someOtherNamespace/' });
    expect(store.getState()).toEqual(initialStore);
  });

  it('calls appropriate saga when dispatching REQUEST_CREATE action', () => {

  });

  it('normalises a WP-API response and places in store', () => {
    const normalisedData = normalisers[SubjectTypes.POST](postJson);
    const entities = normalisedData.entities.posts;

    store.dispatch(
      receive(SubjectTypes.POST, postJson)
    );

    expect(store.getState()).toEqual({
      repress: {
        posts: entities
      }
    })
  });
});
