import React from 'react';
import { MCPSettings } from '../MCP/MCPSettings/MCPSettings';
import { MCPSettingsType } from '../../types';

export function SettingsPage() {
  const handleSaveSettings = (config: MCPSettingsType): void => {
    console.log('Saving settings:', config);
    // Implementar lógica de salvamento
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      <MCPSettings onSave={handleSaveSettings} />
    </div>
  );
}
