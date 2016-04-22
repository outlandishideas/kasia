jest.disableAutomock();

import React  from 'react';
import { mount } from 'enzyme';

import postJson from './fixtures/wp-api-responses/post'

import ActionTypes from '../constants/ActionTypes';
import ContentTypes from '../constants/ContentTypes';
import configureStore from './util/configureStore';
import { receive } from '../actionCreators';

import BuiltInContentType from './components/BuiltInContentType';
import DerivedContentType from './components/DerivedContentType';
import CustomContentType from './components/CustomContentType';

const { store, interceptReducer } = configureStore();

const testProps = {
  store,
  params: {
    id: String(postJson.id)
  }
};

describe('Repress connect', () => {
  describe('with built-in content type', () => {
    const rendered = mount(
      <BuiltInContentType {...testProps} testProp={true}/>
    );

    it('should wrap the component', () => {
      expect(BuiltInContentType.__repress).toBe(true);
    });

    it('should pass props down', () => {
      expect(rendered.props().testProp).toBe(true);
    });

    it('should dispatch an action corresponding to given configuration', () => {
      const action = interceptReducer.mock.calls[3][1];
      expect(action.type).toEqual(ActionTypes.POST.REQUEST.CREATE);
      expect(action.options.contentType).toEqual(ContentTypes.POST);
    });
  });

  describe('with derived built-in content type', () => {
    store.dispatch(receive(ContentTypes.POST, postJson));

    const rendered = mount(<DerivedContentType {...testProps} testProp={true}/>);

    it('should dispatch an action corresponding to given configuration', () => {
      const action = interceptReducer.mock.calls[5][1];
      expect(action.type).toEqual(ActionTypes.POST.REQUEST.CREATE);
      expect(action.options.contentType).toEqual(ContentTypes.POST);
    });

    // TODO this is surely wrong... how to access final props properly?
    it('should receive post on props', () => {
      expect(rendered.nodes[0].mergedProps.post.id).toEqual(postJson.id);
    });
  });

  describe('with custom content type', () => {
    mount(<CustomContentType {...testProps} testProp={true}/>);

    it('should dispatch an action corresponding to given configuration', () => {
      const action = interceptReducer.mock.calls[6][1];
      expect(action.type).toEqual(ActionTypes.CUSTOM_CONTENT_TYPE.REQUEST.CREATE);
      expect(action.options.contentType).toEqual('CustomContentType');
    });
  });
});
