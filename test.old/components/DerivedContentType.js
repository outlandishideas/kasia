/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import connectWordPress from '../../src/connect'

@connectWordPress((props) => props.params.id)
export default class DerivedPost extends Component {
  render () {
    return <div></div>
  }
}
