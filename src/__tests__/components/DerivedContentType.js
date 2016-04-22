jest.disableAutomock();

import React, { Component } from 'react';

import repressConnect from '../../connect';

@repressConnect()
export default class DerivedPost extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return <div>Hello, World!</div>;
  }
}
