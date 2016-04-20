jest.unmock('redux');
jest.unmock('react-redux');
jest.unmock('sinon');

jest.unmock('../reducer');
jest.unmock('../connect');

import React, { Component } from 'react';
import TestUtils from 'react-addons-test-utils';
import { createStore } from 'redux';
import sinon from 'sinon';

import ActionTypes from '../ActionTypes';
import repressReducer from '../reducer';
import repressConnect from '../connect';

const renderer = TestUtils.createRenderer();
const store = createStore(repressReducer, { repress: {} });

const testPostTypeName = 'TestPostType';

const testProps = {
  store,
  params: {
    id: 'test_post_id'
  }
};

const testConnectOptions = {
  postType: testPostTypeName
};

@repressConnect()
class ConnectedComponent extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return (<div>Hello, World!</div>);
  }
}

describe('Repress connect', () => {
  it('wraps a component', () => {
    expect(ConnectedComponent.__repress).toBe(true);
  });
});

describe('Repress connected component', () => {
  const originalDispatch = store.dispatch;

  beforeAll(() => sinon.spy(store, 'dispatch'));

  afterAll(() => {
    store.dispatch = originalDispatch;
  })

  const component = <ConnectedComponent {...testProps} testProp={true} />;

  it('passes props down to children', () => {
    const rendered = renderer.render(component);
    expect(rendered.props.testProp).toBe(true);
  });

  it('dispatches an action corresponding to given configuration', () => {
    store.dispatch.calledWith({
      type: ActionTypes.REQUEST_POST,
      data: {
        params: testProps.params,
        connectOptions: testConnectOptions
      }
    });
  });
});
