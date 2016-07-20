/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { Post } from '../../src/constants/ContentTypes'
import connectWordPress from '../../src/connect'

@connectWordPress(Post, (props) => props.params.id)
export default class BuiltInContentType extends Component {
  render () {
    return <div></div>
  }
}
