import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
  name: 'n8n Workflow Manager',
  entryPointUriPath,
  cloudIdentifier: process.env.CLOUD_IDENTIFIER || 'gcp-eu',
  env: {
    development: {
      initialProjectKey: 'ifarg-project',
    },
    production: {
      applicationId: process.env.CUSTOM_APPLICATION_ID || 'cmqjj3n1u000t01z2lkhwgl1m',
      url: process.env.APPLICATION_URL || 'https://your_app_hostname.com',
    },
  },
  oAuthScopes: {
    view: ['view_orders', 'view_customers', 'view_products', 'view_subscriptions'],
    manage: ['manage_subscriptions'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'n8n Workflows',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'workflows',
      defaultLabel: 'Workflows',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
    {
      uriPath: 'triggers',
      defaultLabel: 'Triggers',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;
