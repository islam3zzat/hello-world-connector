import { defineMessages } from 'react-intl';

export default defineMessages({
  titleCreate: {
    id: 'WorkflowDetails.titleCreate',
    defaultMessage: 'Create Workflow',
  },
  titleEdit: {
    id: 'WorkflowDetails.titleEdit',
    defaultMessage: 'Edit Workflow',
  },
  fieldName: {
    id: 'WorkflowDetails.fieldName',
    defaultMessage: 'Workflow Name',
  },
  fieldNameHint: {
    id: 'WorkflowDetails.fieldNameHint',
    defaultMessage: 'A descriptive name for this workflow trigger.',
  },
  fieldResourceType: {
    id: 'WorkflowDetails.fieldResourceType',
    defaultMessage: 'Resource Type',
  },
  fieldMessageTypes: {
    id: 'WorkflowDetails.fieldMessageTypes',
    defaultMessage: 'Message Types',
  },
  fieldMessageTypesHint: {
    id: 'WorkflowDetails.fieldMessageTypesHint',
    defaultMessage: 'Select which message types trigger this workflow.',
  },
  fieldWebhookUrl: {
    id: 'WorkflowDetails.fieldWebhookUrl',
    defaultMessage: 'n8n Webhook URL',
  },
  fieldWebhookUrlHint: {
    id: 'WorkflowDetails.fieldWebhookUrlHint',
    defaultMessage: 'The webhook URL from your n8n workflow.',
  },
  fieldEnabled: {
    id: 'WorkflowDetails.fieldEnabled',
    defaultMessage: 'Enabled',
  },
  saveButton: {
    id: 'WorkflowDetails.saveButton',
    defaultMessage: 'Save',
  },
  cancelButton: {
    id: 'WorkflowDetails.cancelButton',
    defaultMessage: 'Cancel',
  },
  saveSuccess: {
    id: 'WorkflowDetails.saveSuccess',
    defaultMessage: 'Workflow saved successfully.',
  },
});
