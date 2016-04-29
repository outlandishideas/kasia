jest.disableAutomock();

import React, { Component } from 'react';

import ContentTypes from '../../src/constants/ContentTypes';
import connectWordPress from '../../src/connect';

const testConnectOptions = {
  contentType: ContentTypes.POST,
  fetchDataOptions: {}
};

@connectWordPress(testConnectOptions)
export default class BuiltInContentType extends Component {}
