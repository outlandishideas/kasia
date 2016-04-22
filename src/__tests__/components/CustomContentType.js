jest.disableAutomock();

import React, { Component } from 'react';

import { registerCustomContentType } from '../../contentTypes';
import repressConnect from '../../connect';

const contentType = 'CustomContentType';

registerCustomContentType(contentType);

@repressConnect({ contentType })
export default class CustomContentType extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return <div>Hello, World!</div>;
  }
}
