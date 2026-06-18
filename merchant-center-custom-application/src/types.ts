export type WorkflowTrigger = {
  resourceTypeId: string;
  types: string[];
};

export type WorkflowValue = {
  name: string;
  webhookUrl: string;
  trigger: WorkflowTrigger;
  subscriptionId: string | null;
  enabled: boolean;
};

export type WorkflowCustomObject = {
  id: string;
  key: string;
  container: string;
  version: number;
  value: WorkflowValue;
  createdAt: string;
  lastModifiedAt: string;
};

export type TSyncAction = { action: string; [x: string]: unknown };
export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;
