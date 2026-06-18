import { graphql } from 'msw';
import { setupServer } from 'msw/node';
import {
  mapResourceAccessToAppliedPermissions,
  screen,
  type TRenderAppWithReduxOptions,
} from '@commercetools-frontend/application-shell/test-utils';
import { entryPointUriPath, PERMISSIONS } from '../../constants';
import ApplicationRoutes from '../../routes';
import { renderApplicationWithRedux } from '../../test-utils';

const mockServer = setupServer();
afterEach(() => mockServer.resetHandlers());
beforeAll(() => {
  mockServer.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  mockServer.close();
});

const renderApp = (options: Partial<TRenderAppWithReduxOptions> = {}) => {
  const route = options.route || `/my-project/${entryPointUriPath}`;
  const { history } = renderApplicationWithRedux(<ApplicationRoutes />, {
    route,
    project: {
      allAppliedPermissions: mapResourceAccessToAppliedPermissions([
        PERMISSIONS.View,
      ]),
    },
    ...options,
  });
  return { history };
};

it('should redirect to /workflows from root', async () => {
  mockServer.use(
    graphql.query('FetchWorkflows', (_req, res, ctx) => {
      return res(
        ctx.data({
          customObjects: {
            results: [],
            total: 0,
            count: 0,
            offset: 0,
          },
        })
      );
    })
  );
  const { history } = renderApp();
  await screen.findByText('n8n Workflows');
  expect(history.location.pathname).toContain('/workflows');
});
