import type { ReactNode } from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Workflows from './components/workflows';
import Triggers from './components/triggers';

type ApplicationRoutesProps = {
  children?: ReactNode;
};

const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const match = useRouteMatch();

  return (
    <Spacings.Inset scale="l">
      <Switch>
        <Route path={`${match.path}/workflows`}>
          <Workflows />
        </Route>
        <Route path={`${match.path}/triggers`}>
          <Triggers />
        </Route>
        <Route>
          <Redirect to={`${match.url}/workflows`} />
        </Route>
      </Switch>
    </Spacings.Inset>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
