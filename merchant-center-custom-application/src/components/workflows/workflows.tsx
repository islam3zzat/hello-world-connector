import { useIntl } from 'react-intl';
import { Link as RouterLink, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import Constraints from '@commercetools-uikit/constraints';
import DataTable from '@commercetools-uikit/data-table';
import FlatButton from '@commercetools-uikit/flat-button';
import { usePaginationState } from '@commercetools-uikit/hooks';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import PrimaryButton from '@commercetools-uikit/primary-button';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../helpers';
import {
  useWorkflowsFetcher,
  useWorkflowDeleter,
} from '../../hooks/use-workflows-connector';
import type { WorkflowCustomObject } from '../../types';
import WorkflowDetails from '../workflow-details';
import messages from './messages';

const PAGE_SIZE = 20;

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'resourceType', label: 'Resource Type' },
  { key: 'messageTypes', label: 'Message Types' },
  { key: 'webhookUrl', label: 'Webhook URL' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

const Workflows = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { push } = useHistory();
  const { page, perPage } = usePaginationState({ perPage: PAGE_SIZE });

  const { workflowsPaginatedResult, error, loading, refetch } =
    useWorkflowsFetcher({
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
    });

  const { execute: deleteWorkflow } = useWorkflowDeleter();

  const handleDelete = async (workflow: WorkflowCustomObject) => {
    if (
      window.confirm(
        intl.formatMessage(messages.deleteConfirm, {
          name: workflow.value.name,
        })
      )
    ) {
      await deleteWorkflow({ key: workflow.key, version: workflow.version });
      refetch();
    }
  };

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Inline justifyContent="space-between" alignItems="center">
        <Text.Headline as="h2" intlMessage={messages.title} />
        <PrimaryButton
          iconLeft={<PlusBoldIcon />}
          label={intl.formatMessage(messages.createWorkflow)}
          onClick={() => push(`${match.url}/new`)}
        />
      </Spacings.Inline>

      {loading && <LoadingSpinner />}

      {!loading && workflowsPaginatedResult?.results.length === 0 && (
        <Constraints.Horizontal max={13}>
          <ContentNotification type="info">
            <Text.Body intlMessage={messages.noWorkflows} />
          </ContentNotification>
        </Constraints.Horizontal>
      )}

      {workflowsPaginatedResult && workflowsPaginatedResult.results.length > 0 && (
        <Spacings.Stack scale="l">
          <DataTable<WorkflowCustomObject>
            isCondensed
            columns={columns}
            rows={workflowsPaginatedResult.results}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'name':
                  return item.value.name;
                case 'resourceType':
                  return item.value.trigger.resourceTypeId;
                case 'messageTypes':
                  return item.value.trigger.types.slice(0, 3).join(', ') +
                    (item.value.trigger.types.length > 3
                      ? ` +${item.value.trigger.types.length - 3} more`
                      : '');
                case 'webhookUrl':
                  return item.value.webhookUrl.length > 50
                    ? item.value.webhookUrl.slice(0, 50) + '…'
                    : item.value.webhookUrl;
                case 'status':
                  return item.value.enabled
                    ? intl.formatMessage(messages.statusEnabled)
                    : intl.formatMessage(messages.statusDisabled);
                case 'actions':
                  return (
                    <Spacings.Inline scale="s">
                      <FlatButton
                        as={RouterLink}
                        to={`${match.url}/${item.key}`}
                        label={intl.formatMessage(messages.editAction)}
                      />
                      <SecondaryButton
                        label={intl.formatMessage(messages.deleteAction)}
                        onClick={() => handleDelete(item)}
                        tone="urgent"
                      />
                    </Spacings.Inline>
                  );
                default:
                  return null;
              }
            }}
            onRowClick={(row) => push(`${match.url}/${row.key}`)}
          />
          <Pagination
            page={page.value}
            onPageChange={page.onChange}
            perPage={perPage.value}
            onPerPageChange={perPage.onChange}
            totalItems={workflowsPaginatedResult.total}
            perPageRange="s"
          />
        </Spacings.Stack>
      )}

      <Switch>
        <SuspendedRoute path={`${match.url}/:key`}>
          <WorkflowDetails
            onClose={() => {
              push(match.url);
              refetch();
            }}
          />
        </SuspendedRoute>
      </Switch>
    </Spacings.Stack>
  );
};
Workflows.displayName = 'Workflows';

export default Workflows;
