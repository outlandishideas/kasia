jest.disableAutomock();

import React, { Component } from 'react';
import { mount, render } from 'enzyme';

import pageJson from './fixtures/wp-api-responses/post'
import configureStore from './util/configureStore';

import { completeRequest } from '../src/creators';
import { ContentTypes } from '../src/index';
import PepperoniComponent, { Page } from '../src/components';

const { store } = configureStore({
  host: 'test',
  entityKeyPropName: 'slug',
  contentTypes: ['CustomContentType']
});

const testProps = { store };

const Child = ({ page }) => <div>{page.title}</div>;

describe('Component', () => {
  it('throws an error when component declared without slug or id prop', () => {
    expect(() => {
      mount(<Page {...testProps} />);
    }).toThrowError(/Expecting either a slug or id property/);
  });

  it('renders a ready-made component', () => {
    store.dispatch(completeRequest(ContentTypes.PAGE, pageJson));

    const rendered = render(
      <Page {...testProps} slug={pageJson.slug}>
        <Child />
      </Page>
    );

    expect(rendered.text()).toContain(pageJson.title.rendered);
  });

  it('renders a component with explicit content type', () => {
    const rendered = render(
      <PepperoniComponent {...testProps} contentType="page" slug={pageJson.slug}>
        <Child />
      </PepperoniComponent>
    );

    expect(rendered.text()).toContain(pageJson.title.rendered);
  });
});
