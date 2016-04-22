jest.disableAutomock();

import React, { Component } from 'react';

import repressConnect from '../../connect';

export default function makeBadContentTypeComponent () {
  @repressConnect()
  class BadContentType extends Component {
    constructor (props, context) {
      super(props, context);
    }

    render () {
      return <div>Hello, World!</div>;
    }
  }
}
