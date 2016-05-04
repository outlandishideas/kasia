import { fetchResource } from './index'

export default function fetchData (action) {
  return (renderProps, store) => {
    const pepperoniConfig = store.wordpress.config;
    const pluginConfig = store.wordpress.config.plugins.menus;
    return [[fetchResource, action, pepperoniConfig, pluginConfig]];
  };
}
