/* global jest:false */

// jest.disableAutomock() hoisted here by babel-jest

import React, { Component } from 'react'

import { connectWpPost } from '../../../src/connect'

jest.disableAutomock()

@connectWpPost(' :-( ', (props) => props.params.id)
export default class BadContentType extends Component {
  render () {
    return <div />
  }
}
