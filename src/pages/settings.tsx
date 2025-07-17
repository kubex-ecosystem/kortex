import React from 'react';
import { Layout } from '../components/Layout/Layout';
import { MCPSettings } from '../components/MCP/MCPSettings/MCPSettings';
import { MCPSettingsType } from '../types';

export default function Settings() {
  const handleSaveSettings = (config: MCPSettingsType): void => {
    console.log('Saving settings:', config);
    // Implementar lógica de salvamento
  };

  return (
    <Layout>
      <MCPSettings onSave={handleSaveSettings} />
    </Layout>
  );
}
