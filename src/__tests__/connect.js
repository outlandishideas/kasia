jest.unmock('redux');
jest.unmock('react-redux');
jest.unmock('sinon');

jest.unmock('../reducer');
jest.unmock('../connect');

import React, { Component } from 'react';
import { createStore } from 'redux';
import { connect } from 'react-redux';
import TestUtils from 'react-addons-test-utils';
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
class _ConnectedComponent extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return (<div>Hello, World!</div>);
  }
}

const ConnectedComponent = connect((state) => ({
  helloFromMapStateToProps: true
}))(_ConnectedComponent);

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
  });

  const component = <ConnectedComponent {...testProps} testProp={true} />;
  const rendered = renderer.render(component);

  it('passes props down to children', () => {
    expect(rendered.props.testProp).toBe(true);
  });

  it('does not inhibit redux connect from performing own mapStateToProps', () => {
    expect(rendered.props.helloFromMapStateToProps).toBe(true);
  });

  it('dispatches an action corresponding to given configuration', () => {
    store.dispatch.calledWith({
      type: ActionTypes.REQUEST_POST,
      params: testProps.params,
      connectOptions: testConnectOptions
    });
  });
});
