
import React from 'react';
import { Helmet } from 'react-helmet';

export default function MasterForms() {
  return (
    <>
      <Helmet>
        <title>Master Forms - ENIS CRM</title>
        <meta name="description" content="Manage all master forms." />
      </Helmet>
      <div className="text-white">
        <h1 className="text-3xl font-bold">Master Forms</h1>
        <p>Manage your master forms here.</p>
      </div>
    </>
  );
}
