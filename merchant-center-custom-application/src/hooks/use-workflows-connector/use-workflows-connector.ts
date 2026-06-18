/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { WorkflowCustomObject, WorkflowValue } from '../../types';
import { CONTAINER } from '../../constants';
import FetchWorkflowsQuery from './fetch-workflows.ctp.graphql';
import FetchWorkflowQuery from './fetch-workflow.ctp.graphql';
import CreateOrUpdateWorkflowMutation from './create-or-update-workflow.ctp.graphql';
import DeleteWorkflowMutation from './delete-workflow.ctp.graphql';

type WorkflowsQueryResult = {
  customObjects: {
    results: WorkflowCustomObject[];
    total: number;
    count: number;
    offset: number;
  };
};

type WorkflowQueryResult = {
  customObject: WorkflowCustomObject | null;
};

type CreateOrUpdateResult = {
  createOrUpdateCustomObject: WorkflowCustomObject;
};

type DeleteResult = {
  deleteCustomObject: { id: string; key: string };
};

export const useWorkflowsFetcher = ({
  limit = 20,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
}) => {
  const { data, error, loading, refetch } = useMcQuery<WorkflowsQueryResult>(
    FetchWorkflowsQuery,
    {
      variables: { container: CONTAINER, limit, offset },
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
    }
  );

  return {
    workflowsPaginatedResult: data?.customObjects,
    error: error as ApolloError | undefined,
    loading,
    refetch,
  };
};

export const useWorkflowFetcher = (key: string) => {
  const { data, error, loading } = useMcQuery<WorkflowQueryResult>(
    FetchWorkflowQuery,
    {
      variables: { container: CONTAINER, key },
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      skip: !key,
    }
  );

  return {
    workflow: data?.customObject,
    error: error as ApolloError | undefined,
    loading,
  };
};

export const useWorkflowUpdater = () => {
  const [createOrUpdate, { loading }] = useMcMutation<CreateOrUpdateResult>(
    CreateOrUpdateWorkflowMutation
  );

  const execute = async ({
    key,
    value,
  }: {
    key: string;
    value: WorkflowValue;
  }) => {
    return createOrUpdate({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: {
        draft: {
          container: CONTAINER,
          key,
          value,
        },
      },
    });
  };

  return { loading, execute };
};

export const useWorkflowDeleter = () => {
  const [deleteWorkflow, { loading }] = useMcMutation<DeleteResult>(
    DeleteWorkflowMutation
  );

  const execute = async ({
    key,
    version,
  }: {
    key: string;
    version: number;
  }) => {
    return deleteWorkflow({
      context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
      variables: { container: CONTAINER, key, version },
    });
  };

  return { loading, execute };
};
