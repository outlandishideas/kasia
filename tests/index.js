import React, { Component } from 'react';
import Repress from '../src';

@Repress.connect()
class Test extends Component {
  constructor (props, context) {
    super(props, context);
  }
}

const a = new Test();
console.log(Test.fetchData());
