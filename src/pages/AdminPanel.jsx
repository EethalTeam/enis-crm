
import React from 'react';
import { Helmet } from 'react-helmet';

export default function AdminPanel() {
  return (
    <>
      <Helmet>
        <title>Admin Panel - ENIS CRM</title>
        <meta name="description" content="Manage admin settings." />
      </Helmet>
      <div className="text-white">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p>Manage your admin settings here.</p>
      </div>
    </>
  );
}
