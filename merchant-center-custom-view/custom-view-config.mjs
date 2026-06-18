/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomView}
 */
const config = {
  name: 'Hello World Custom View',
  cloudIdentifier: 'gcp-eu',
  env: {
    development: {
      initialProjectKey: 'ifarg-project',
    },
    production: {
      customViewId: 'cmqjebc5l000l01z2czpfnbo7',
      url: 'https://mc-view-36nqf3f3l5bvbsjz93vnmvrz.europe-west1.gcp.preview.commercetools.app',
    },
  },
  oAuthScopes: {
    view: ['view_products'],
    manage: ['manage_products'],
  },
  type: 'CustomPanel',
  typeSettings: {
    size: 'LARGE',
  },
  locators: ['products.product_details.general'],
};

export default config;
