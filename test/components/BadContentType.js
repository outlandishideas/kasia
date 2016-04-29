jest.disableAutomock();

import React, { Component } from 'react';

import connectWordPress from '../../src/connect';

@connectWordPress()
export default class BadContentType extends Component {}
