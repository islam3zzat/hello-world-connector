// Make sure to import the helper functions from the `ssr` entry point.
import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = 'n8n-workflow-manager';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const CONTAINER = 'n8n-workflow-manager';

export const SUBSCRIPTION_TRIGGERS = [
  {
    resourceTypeId: 'order',
    label: 'Order',
    messageTypes: [
      'OrderCreated', 'OrderStateChanged', 'OrderShipped', 'OrderDelivered',
      'OrderBillingAddressSet', 'OrderShippingAddressSet', 'OrderLineItemAdded',
      'OrderLineItemRemoved', 'OrderCustomLineItemAdded', 'OrderCustomLineItemRemoved',
      'OrderPaymentAdded', 'OrderReturnInfoAdded', 'OrderReturnInfoSet',
      'OrderDiscountCodeAdded', 'OrderDiscountCodeRemoved', 'OrderDiscountCodeStateSet',
      'OrderEditApplied', 'OrderCustomFieldAdded', 'OrderCustomFieldChanged',
      'OrderCustomFieldRemoved', 'OrderCustomTypeSet', 'OrderCustomTypeRemoved',
      'OrderCustomerGroupSet', 'OrderCustomerEmailSet', 'OrderCustomerSet',
      'OrderLineItemDiscountSet', 'OrderCustomLineItemDiscountSet', 'OrderImported',
      'OrderScoreSet', 'OrderStoreSet', 'OrderPurchaseOrderNumberSet',
    ],
  },
  {
    resourceTypeId: 'cart',
    label: 'Cart',
    messageTypes: ['CartCreated'],
  },
  {
    resourceTypeId: 'customer',
    label: 'Customer',
    messageTypes: [
      'CustomerCreated', 'CustomerEmailVerified', 'CustomerAddressAdded',
      'CustomerAddressChanged', 'CustomerAddressRemoved', 'CustomerCompanyNameSet',
      'CustomerDateOfBirthSet', 'CustomerEmailChanged', 'CustomerFirstNameSet',
      'CustomerLastNameSet', 'CustomerGroupSet', 'CustomerPasswordUpdated',
      'CustomerTitleSet', 'CustomerCustomFieldAdded', 'CustomerCustomFieldChanged',
      'CustomerCustomFieldRemoved', 'CustomerCustomTypeSet', 'CustomerCustomTypeRemoved',
      'CustomerStoreAdded', 'CustomerStoreRemoved',
    ],
  },
  {
    resourceTypeId: 'product',
    label: 'Product',
    messageTypes: [
      'ProductCreated', 'ProductPublished', 'ProductUnpublished', 'ProductStateTransition',
      'ProductPriceAdded', 'ProductPriceChanged', 'ProductPriceRemoved', 'ProductPricesSet',
      'ProductImageAdded', 'ProductAssetAdded', 'ProductAssetKeySet', 'ProductAssetChanged',
      'ProductAssetRemoved', 'ProductAssetOrderChanged', 'ProductVariantAdded',
      'ProductVariantDeleted', 'ProductAddedToCategory', 'ProductRemovedFromCategory',
      'ProductSlugChanged', 'ProductRevertedStagedChanges', 'ProductSelectionProductAdded',
      'ProductSelectionProductExcluded', 'ProductSelectionProductRemoved',
      'ProductSelectionVariantExclusionChanged', 'ProductSelectionVariantSelectionChanged',
      'ProductTailoringCreated', 'ProductTailoringPublished', 'ProductTailoringUnpublished',
      'ProductTailoringDeleted',
    ],
  },
  {
    resourceTypeId: 'payment',
    label: 'Payment',
    messageTypes: [
      'PaymentCreated', 'PaymentInteractionAdded', 'PaymentStatusInterfaceCodeSet',
      'PaymentStatusStateTransition', 'PaymentTransactionAdded',
      'PaymentTransactionStateChanged', 'PaymentCustomFieldAdded',
      'PaymentCustomFieldChanged', 'PaymentCustomFieldRemoved',
      'PaymentCustomTypeSet', 'PaymentCustomTypeRemoved',
    ],
  },
  {
    resourceTypeId: 'inventory-entry',
    label: 'Inventory Entry',
    messageTypes: [
      'InventoryEntryCreated', 'InventoryEntryDeleted', 'InventoryEntryQuantitySet',
    ],
  },
  {
    resourceTypeId: 'quote',
    label: 'Quote',
    messageTypes: [
      'QuoteCreated', 'QuoteRenegotiationRequested', 'QuoteStateChanged',
      'QuoteCustomerChanged', 'QuoteValidToSet',
    ],
  },
  {
    resourceTypeId: 'quote-request',
    label: 'Quote Request',
    messageTypes: [
      'QuoteRequestCreated', 'QuoteRequestStateChanged', 'QuoteRequestCustomerChanged',
    ],
  },
  {
    resourceTypeId: 'staged-quote',
    label: 'Staged Quote',
    messageTypes: [
      'StagedQuoteCreated', 'StagedQuoteSellerCommentSet',
      'StagedQuoteStateChanged', 'StagedQuoteValidToSet',
    ],
  },
  {
    resourceTypeId: 'review',
    label: 'Review',
    messageTypes: ['ReviewCreated', 'ReviewRatingSet', 'ReviewStateTransition'],
  },
  {
    resourceTypeId: 'category',
    label: 'Category',
    messageTypes: ['CategoryCreated', 'CategorySlugChanged'],
  },
  {
    resourceTypeId: 'shopping-list',
    label: 'Shopping List',
    messageTypes: [],
  },
  {
    resourceTypeId: 'store',
    label: 'Store',
    messageTypes: [
      'StoreCreated', 'StoreDeleted', 'StoreDistributionChannelsChanged',
      'StoreLanguagesChanged', 'StoreNameSet', 'StoreProductSelectionsChanged',
      'StoreSupplyChannelsChanged', 'StoreCountriesChanged',
    ],
  },
  {
    resourceTypeId: 'business-unit',
    label: 'Business Unit',
    messageTypes: [
      'BusinessUnitAddressAdded', 'BusinessUnitAddressChanged', 'BusinessUnitAddressRemoved',
      'BusinessUnitBillingAddressAdded', 'BusinessUnitBillingAddressRemoved',
      'BusinessUnitContactEmailSet', 'BusinessUnitCreated', 'BusinessUnitCustomTypeSet',
      'BusinessUnitCustomTypeRemoved', 'BusinessUnitCustomFieldAdded',
      'BusinessUnitCustomFieldChanged', 'BusinessUnitCustomFieldRemoved',
      'BusinessUnitDefaultBillingAddressSet', 'BusinessUnitDefaultShippingAddressSet',
      'BusinessUnitDeleted', 'BusinessUnitNameChanged', 'BusinessUnitShippingAddressAdded',
      'BusinessUnitShippingAddressRemoved', 'BusinessUnitStatusChanged',
      'BusinessUnitStoreAdded', 'BusinessUnitStoreModeChanged', 'BusinessUnitStoreRemoved',
    ],
  },
];
