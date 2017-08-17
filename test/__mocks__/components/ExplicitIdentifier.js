/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { ContentTypes } from '../../../src/constants'
import { connectWpPost } from '../../../src/connect'

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
