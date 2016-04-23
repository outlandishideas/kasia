jest.disableAutomock();

import React, { Component } from 'react';

import connectWordPress from '../../connect';

export default function makeBadContentTypeComponent () {
  @connectWordPress()
  class BadContentType extends Component {
    constructor (props, context) {
      super(props, context);
    }
  }
}
