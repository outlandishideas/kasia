jest.disableAutomock();

import React, { Component } from 'react';

import connectWordPress from '../../connect';
import { registerCustomContentType } from '../../contentTypes';

const contentType = 'CustomContentType';

registerCustomContentType(contentType);

@connectWordPress({ contentType })
export default class CustomContentType extends Component {}
