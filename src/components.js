import React, { Component } from 'react';
import { connect } from 'react-redux';
import invariant from 'invariant';
import find from 'lodash.find';

import Plurality from './constants/Plurality';
import ContentTypes from './constants/ContentTypes';
import { deriveContentTypeOptions } from './contentTypes';
import { createRequest } from './creators';

function mapStateToProps (state) {
  return { wordpress: state.wordpress };
}

// ---
// Generic Component
// ---

class PepperoniComponent extends Component {
  getContentTypeOptions () {
    const { contentTypes } = this.props.wordpress.config;

    const contentTypeOpts = this.props.contentType in contentTypes
      ? contentTypes[this.props.contentType]
      : deriveContentTypeOptions(this.props.contentType, contentTypes);

    invariant(
      contentTypeOpts,
      'The content type "%s" is not recognised. ' +
      'Built-ins are available at Pepperoni.ContentTypes. ' +
      'Custom content types should be passed explicitly using the name given at registration.',
      this.props.contentType
    );

    return contentTypeOpts;
  }

  render () {
    const { config, entities } = this.props.wordpress;
    const { params, slug, id } = this.props;

    invariant(
      (slug && !id) || (!slug && id),
      'Expecting either a slug or id property (not both).'
    );

    const subjectId = id || slug;

    const contentTypeOpts = this.getContentTypeOptions();
    const namePlural = contentTypeOpts.name[Plurality.PLURAL];
    const contentTypeCollection = entities[namePlural];
    
    let entity;

    if (contentTypeCollection) {
      entity = config.entityKeyPropName !== 'id'
        ? find(contentTypeCollection, obj => obj[config.entityKeyPropName] === subjectId)
        : contentTypeCollection[subjectId];
    }

    if (!entity) {
      const canonicalName = contentTypeOpts.name.canonical;
      const action = createRequest(canonicalName, subjectId, { params });
      this.props.dispatch(action);
      return null;
    }

    // Pass the content data to all children via their props
    if (this.props.children) {
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
      const children = React.Children
        .map(this.props.children, (child) => {
          return React.cloneElement(child, { [nameSingular]: entity })
        });

      return <div>{children}</div>;
    }

    return this.props.children || null;
  }
}

const ConnectedPepperoniComponent = connect(mapStateToProps)(PepperoniComponent);

export default ConnectedPepperoniComponent;

// ---
// Content Type-specific Components
// ---

function makeReadyMadeComponent (contentType) {
  return class extends Component {
    render () {
      return (
        <ConnectedPepperoniComponent {...this.props} contentType={contentType}>
          {this.props.children}
        </ConnectedPepperoniComponent>
      );
    }
  };
}

const Category = makeReadyMadeComponent(ContentTypes.CATEGORY);
const Comment = makeReadyMadeComponent(ContentTypes.COMMENT);
const Media = makeReadyMadeComponent(ContentTypes.MEDIA);
const Page = makeReadyMadeComponent(ContentTypes.PAGE);
const Post = makeReadyMadeComponent(ContentTypes.POST);
const PostRevision = makeReadyMadeComponent(ContentTypes.POST_REVISION);
const PostType = makeReadyMadeComponent(ContentTypes.POST_TYPE);
const PostStatus = makeReadyMadeComponent(ContentTypes.POST_STATUS);
const Tag = makeReadyMadeComponent(ContentTypes.TAG);
const Taxonomy = makeReadyMadeComponent(ContentTypes.TAXONOMY);
const User = makeReadyMadeComponent(ContentTypes.USER);

export { Category, Comment, Media, Page, Post, PostRevision, PostType, PostStatus, Tag, Taxonomy, User };
