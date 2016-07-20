/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpPost } from '../../src/connect'

@connectWpPost('News', (props) => props.params.id)
export default class News extends Component {
  render () {
    return <div></div>
  }
}
