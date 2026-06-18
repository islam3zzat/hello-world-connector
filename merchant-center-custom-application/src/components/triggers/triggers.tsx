import { useIntl } from 'react-intl';
import DataTable from '@commercetools-uikit/data-table';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { SUBSCRIPTION_TRIGGERS } from '../../constants';
import messages from './messages';

const columns = [
  { key: 'resourceTypeId', label: 'Resource Type' },
  { key: 'messageTypes', label: 'Message Types' },
];

type TriggerRow = {
  id: string;
  resourceTypeId: string;
  label: string;
  messageTypes: readonly string[];
};

const triggerRows: TriggerRow[] = SUBSCRIPTION_TRIGGERS.map((t) => ({
  id: t.resourceTypeId,
  ...t,
}));

const Triggers = () => {
  const intl = useIntl();

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xs">
        <Text.Headline as="h2" intlMessage={messages.title} />
        <Text.Body intlMessage={messages.description} />
      </Spacings.Stack>

      <DataTable<TriggerRow>
        isCondensed
        columns={columns}
        rows={triggerRows}
        itemRenderer={(item, column) => {
          switch (column.key) {
            case 'resourceTypeId':
              return (
                <Spacings.Stack scale="xs">
                  <Text.Body isBold>{item.label}</Text.Body>
                  <Text.Detail tone="secondary">{item.resourceTypeId}</Text.Detail>
                </Spacings.Stack>
              );
            case 'messageTypes':
              return item.messageTypes.length === 0
                ? '(all changes)'
                : item.messageTypes.join(', ');
            default:
              return null;
          }
        }}
      />
    </Spacings.Stack>
  );
};
Triggers.displayName = 'Triggers';

export default Triggers;
