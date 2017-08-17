/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpQuery } from '../../../src/connect'

export const queryFn = () => ({title: 'Preserved Title'})

export class target extends Component {
  static queryFn = queryFn

  render () {
    const {data} = this.props.kasia
    return <div>{data.title}</div>
  }
}

export default connectWpQuery(queryFn, {preserve: true})(target)
