import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

// Importar componentes
import App from './App';
import InspectionForm from './components/inspections/InspectionForm';
import InspectionDetails from './components/inspections/InspectionDetails';

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/inspections/new" component={InspectionForm} />
        <Route exact path="/inspections/:id" component={InspectionDetails} />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
};

export default Routes; 