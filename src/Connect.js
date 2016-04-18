import React, { Component } from 'react';
import { connect } from 'react-redux';

const mapRouteParamsToRequest = (routeParams) => {
  return {

  };
};

export default function repressConnect (options = {
  /** The name of the WP-API subject used in API request. */
  subject: 'post',
  /** From which property on the component's props will the route parameters be derived? */
  routeParamsPropName: 'params',
  /** A function which maps the route parameters to the necessary canonical WP-API query parameters. */
  mapRouteParamsToRequest,
  /** Will the request to WP-API be made with the `_embed` query parameter? */
  useEmbedRequestQuery: true,
  /** react-redux connect() decorator argument proxies. */
  connect: {
    mapStateToProps: undefined,
    mapDispatchToProps: undefined,
    mergeProps: undefined,
    connectOptions: undefined
  }
}) {
  return (target) => {
    const { mapRouteParamsToRequest, routeParamsPropName, mapDispatchToProps,
      mergeProps, connectOptions } = options.connect;

    const mapStateToProps = (state) => Object.assign(
      options.connect.mapStateToProps(state),
      { data: mapRouteParamsToRequest(this.props[routeParamsPropName]) }
    );

    @connect(mapStateToProps, mapDispatchToProps, mergeProps, connectOptions)
    class RepressComponentWrapper extends Component {
      constructor (props, context) {
        super(props, context);

      }
    }

    return new RepressComponentWrapper(this.props);
  };
};
