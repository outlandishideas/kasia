jest.disableAutomock();

import React, { Component } from 'react';

import connectWordPress from '../../connect';

@connectWordPress()
export default class DerivedPost extends Component {
  constructor (props, context) {
    super(props, context);
  }
}
