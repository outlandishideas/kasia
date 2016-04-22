jest.disableAutomock();

import React, { Component } from 'react';
import { combineReducers, createStore} from 'redux';
import { mount } from 'enzyme';

import ActionTypes from '../constants/ActionTypes';
import ContentTypes from '../constants/ContentTypes';
import repressReducer from '../reducer';
import repressConnect from '../connect';

// TODO add saga middleware

const interceptReducer = jest.fn();
interceptReducer.mockReturnValue({});

const rootReducer = combineReducers({
  intercept: interceptReducer,
  ...repressReducer
});

const store = createStore(rootReducer, {});

const testProps = {
  store,
  params: {
    id: 'test_post_id'
  }
};

const testConnectOptions = {
  contentType: ContentTypes.POST,
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
  const rendered = mount(
    <ConnectedComponent {...testProps} testProp={true} />
  );

  it('wraps a component...', () => {
    expect(ConnectedComponent.__repress).toBe(true);
  });

  it('...that passes props down', () => {
    expect(rendered.props().testProp).toBe(true);
  });

  it('...that dispatches an action corresponding to given configuration', () => {
    expect(interceptReducer.mock.calls[3][1]).toEqual({
      type: ActionTypes.POST.REQUEST.CREATE,
      options: {
        params: testProps.params,
        ...testConnectOptions
      }
    });
  });
});
