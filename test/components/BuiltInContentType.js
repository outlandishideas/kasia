/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import ContentTypes from '../../src/constants/ContentTypes'
import connectWordPress from '../../src/connect'

@connectWordPress(ContentTypes.POST, (props) => props.params.id)
export default class BuiltInContentType extends Component {
  render () {
    return <div></div>
  }
}
