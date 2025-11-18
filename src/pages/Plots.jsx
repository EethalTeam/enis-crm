
import React from 'react';
import { Helmet } from 'react-helmet';

export default function Plots() {
  return (
    <>
      <Helmet>
        <title>Plots - ENIS CRM</title>
        <meta name="description" content="Manage all plots." />
      </Helmet>
      <div className="text-white">
        <h1 className="text-3xl font-bold">Plots</h1>
        <p>Manage your plots here.</p>
      </div>
    </>
  );
}
