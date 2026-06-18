import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import Constraints from '@commercetools-uikit/constraints';
import FieldLabel from '@commercetools-uikit/field-label';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import SelectInput from '@commercetools-uikit/select-input';
import Spacings from '@commercetools-uikit/spacings';
import TextInput from '@commercetools-uikit/text-input';
import Text from '@commercetools-uikit/text';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { getErrorMessage } from '../../helpers';
import {
  useWorkflowFetcher,
  useWorkflowUpdater,
} from '../../hooks/use-workflows-connector';
import { SUBSCRIPTION_TRIGGERS } from '../../constants';
import type { WorkflowValue } from '../../types';
import messages from './messages';

type Props = {
  onClose: () => void;
};

const isNew = (key: string) => key === 'new';

const generateKey = () =>
  `workflow-${Math.random().toString(36).slice(2, 10)}`;

const defaultFormState = (): WorkflowValue => ({
  name: '',
  webhookUrl: '',
  trigger: { resourceTypeId: 'order', types: [] },
  subscriptionId: null,
  enabled: true,
});

const WorkflowDetails = ({ onClose }: Props) => {
  const intl = useIntl();
  const { key } = useParams<{ key: string }>();
  const creating = isNew(key);

  const { workflow, error: fetchError, loading } = useWorkflowFetcher(
    creating ? '' : key
  );

  const { execute: save, loading: saving } = useWorkflowUpdater();

  const [form, setForm] = useState<WorkflowValue>(defaultFormState);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (workflow) {
      setForm(workflow.value);
    }
  }, [workflow]);

  const selectedTrigger = SUBSCRIPTION_TRIGGERS.find(
    (t) => t.resourceTypeId === form.trigger.resourceTypeId
  );

  const resourceTypeOptions = SUBSCRIPTION_TRIGGERS.map((t) => ({
    value: t.resourceTypeId,
    label: t.label,
  }));

  const messageTypeOptions = (selectedTrigger?.messageTypes ?? []).map(
    (m) => ({ value: m, label: m })
  );

  const handleResourceTypeChange = (resourceTypeId: string) => {
    setForm((prev) => ({
      ...prev,
      trigger: { resourceTypeId, types: [] },
    }));
  };

  const handleMessageTypesChange = (types: string[]) => {
    setForm((prev) => ({
      ...prev,
      trigger: { ...prev.trigger, types },
    }));
  };

  const handleSubmit = async () => {
    setSaveError(null);
    try {
      await save({ key: creating ? generateKey() : key, value: form });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (fetchError) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(fetchError)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Constraints.Horizontal max={7}>
      <Spacings.Stack scale="l">
        <Text.Headline as="h3">
          {intl.formatMessage(creating ? messages.titleCreate : messages.titleEdit)}
        </Text.Headline>

        {saveError && (
          <ContentNotification type="error">
            <Text.Body>{saveError}</Text.Body>
          </ContentNotification>
        )}

        <Spacings.Stack scale="m">
          <Spacings.Stack scale="xs">
            <FieldLabel
              title={intl.formatMessage(messages.fieldName)}
              hint={intl.formatMessage(messages.fieldNameHint)}
            />
            <TextInput
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </Spacings.Stack>

          <Spacings.Stack scale="xs">
            <FieldLabel title={intl.formatMessage(messages.fieldResourceType)} />
            <SelectInput
              value={form.trigger.resourceTypeId}
              options={resourceTypeOptions}
              onChange={(e) => handleResourceTypeChange(e.target.value as string)}
            />
          </Spacings.Stack>

          {messageTypeOptions.length > 0 && (
            <Spacings.Stack scale="xs">
              <FieldLabel
                title={intl.formatMessage(messages.fieldMessageTypes)}
                hint={intl.formatMessage(messages.fieldMessageTypesHint)}
              />
              <SelectInput
                isMulti
                value={form.trigger.types.map((t) => ({ value: t, label: t }))}
                options={messageTypeOptions}
                onChange={(selected) => {
                  const types = Array.isArray(selected)
                    ? selected.map((s) => s.value)
                    : [];
                  handleMessageTypesChange(types);
                }}
              />
            </Spacings.Stack>
          )}

          <Spacings.Stack scale="xs">
            <FieldLabel
              title={intl.formatMessage(messages.fieldWebhookUrl)}
              hint={intl.formatMessage(messages.fieldWebhookUrlHint)}
            />
            <TextInput
              value={form.webhookUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, webhookUrl: e.target.value }))
              }
            />
          </Spacings.Stack>

          <CheckboxInput
            isChecked={form.enabled}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, enabled: e.target.checked }))
            }
            label={intl.formatMessage(messages.fieldEnabled)}
          />
        </Spacings.Stack>

        <Spacings.Inline>
          <PrimaryButton
            label={intl.formatMessage(messages.saveButton)}
            onClick={handleSubmit}
            isDisabled={saving || !form.name || !form.webhookUrl}
          />
          <SecondaryButton
            label={intl.formatMessage(messages.cancelButton)}
            onClick={onClose}
          />
        </Spacings.Inline>
      </Spacings.Stack>
    </Constraints.Horizontal>
  );
};
WorkflowDetails.displayName = 'WorkflowDetails';

export default WorkflowDetails;
