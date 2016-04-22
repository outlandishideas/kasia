jest.disableAutomock();

import React, { Component } from 'react';

import ContentTypes from '../../constants/ContentTypes';
import repressConnect from '../../connect';

const testConnectOptions = {
  contentType: ContentTypes.POST,
  useEmbedRequestQuery: true,
  fetchDataOptions: {}
};

@repressConnect(testConnectOptions)
export default class BuiltInContentType extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return <div>Hello, World!</div>;
  }
}
