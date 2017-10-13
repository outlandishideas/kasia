/* global jest:false */

// jest.disableAutomock() hoisted here by babel-jest

import React, { Component } from 'react'

import connectWpPost from '../../../src/connect/connectWpPost'
import { ContentTypes } from '../../../src/constants'

jest.disableAutomock()

export class target extends Component {
  render () {
    const { query, post } = this.props.kasia
    if (!query.complete || !query.OK) return <div>Loading...</div>
    return <div>{post.title.rendered}</div>
  }
}

export default connectWpPost(
  ContentTypes.Post,
  'architecto-enim-omnis-repellendus'
)(target)
