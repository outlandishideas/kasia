jest.disableAutomock();

import React, { Component } from 'react';

import connectWordPress from '../../connect';

@connectWordPress({ contentType: 'CustomContentType' })
export default class CustomContentType extends Component {}
