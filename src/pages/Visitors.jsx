
import React from 'react';
import { Helmet } from 'react-helmet';

export default function Visitors() {
  return (
    <>
      <Helmet>
        <title>Visitors - ENIS CRM</title>
        <meta name="description" content="Manage all visitors." />
      </Helmet>
      <div className="text-white">
        <h1 className="text-3xl font-bold">Visitors</h1>
        <p>Manage your visitors here.</p>
      </div>
    </>
  );
}
