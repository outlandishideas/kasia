jest.disableAutomock();

import React, { Component } from 'react';

import ContentTypes from '../../constants/ContentTypes';
import connectWordPress from '../../connect';

const testConnectOptions = {
  contentType: ContentTypes.POST,
  useEmbedRequestQuery: true,
  fetchDataOptions: {}
};

@connectWordPress(testConnectOptions)
export default class BuiltInContentType extends Component {
  constructor (props, context) {
    super(props, context);
  }
}
