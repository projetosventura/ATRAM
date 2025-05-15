import React from 'react';
import { useParams } from 'react-router-dom';
import PublicInspectionForm from '../components/inspections/PublicInspectionForm';

const InspectionPage = () => {
  const { token } = useParams();

  return <PublicInspectionForm token={token} />;
};

export default InspectionPage; 