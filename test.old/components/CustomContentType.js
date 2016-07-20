/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import connectWordPress from '../../src/connect'

@connectWordPress('CustomContentType', (props) => props.params.id)
export default class CustomContentType extends Component {
  render () {
    return <div></div>
  }
}
