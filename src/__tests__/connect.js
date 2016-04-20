jest.unmock('redux');
jest.unmock('sinon');

jest.unmock('../ActionTypes');
jest.unmock('../sagas');
jest.unmock('../reducer');
jest.unmock('../connect');

import React, { Component } from 'react';
import { combineReducers, createStore } from 'redux';
import { mount } from 'enzyme';
import sinon from 'sinon';

import ActionTypes from '../ActionTypes';
import repressReducer from '../reducer';
import repressConnect from '../connect';

const interceptReducer = sinon.stub();
interceptReducer.returns({});

const rootReducer = combineReducers({
  intercept: interceptReducer,
  repress: repressReducer
});

const store = createStore(rootReducer, { repress: {} });

const testProps = {
  store,
  params: {
    id: 'test_post_id'
  }
};

const testConnectOptions = {
  postType: 'testPostType',
  useEmbedRequestQuery: true,
  fetchDataOptions: {}
};

@repressConnect(testConnectOptions)
class ConnectedComponent extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return <div>Hello, World!</div>;
  }
}

describe('Repress connect decorator', () => {
  it('wraps a component', () => {
    expect(ConnectedComponent.__repress).toBe(true);
  });
});

describe('A connected component', () => {
  const rendered = mount(
    <ConnectedComponent {...testProps} testProp={true} />
  );

  it('passes props down', () => {
    expect(rendered.props().testProp).toBe(true);
  });

  it('dispatches an action corresponding to given configuration', () => {
    expect(interceptReducer.calledWith({}, {
      type: ActionTypes.REQUEST_POST,
      params: testProps.params,
      options: testConnectOptions
    })).toBe(true);
  });
});
