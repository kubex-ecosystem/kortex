import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Edit3,
  FileText,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Users,
  Wand2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout/Layout';

interface Idea {
  id: string;
  text: string;
}

interface Agent {
  id: string;
  title: string;
  role: string;
  skills: string[];
  restrictions: string[];
  promptExample: string;
}

const PromptEngineeringPage: React.FC = () => {
  const { t } = useTranslation();

  // Estados do Prompt Crafter
  const [currentInput, setCurrentInput] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [purpose, setPurpose] = useState('Desenvolvimento');
  const [customPurpose, setCustomPurpose] = useState('');
  const [maxLength, setMaxLength] = useState(3000);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados dos Agents
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [showAgentForm, setShowAgentForm] = useState(false);

  // Estados de API Integration
  const [apiProvider, setApiProvider] = useState('synex');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('claude-3-sonnet');

  // UI States
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'crafter' | 'agents'>('crafter');

  // Propósitos predefinidos
  const purposes = [
    'Desenvolvimento',
    'Análise de Dados',
    'Criação de Conteúdo',
    'Documentação',
    'Debugging',
    'Code Review',
    'DevOps',
    'Outros'
  ];

  // Carregar configurações iniciais
  useEffect(() => {
    loadAgents();
    checkSynexConnection();
  }, []);

  // Auto-collapse control
  useEffect(() => {
    if (generatedPrompt) {
      setIsInputCollapsed(true);
      setIsOutputCollapsed(false);
    } else {
      setIsInputCollapsed(false);
      setIsOutputCollapsed(true);
    }
  }, [generatedPrompt]);

  const loadAgents = async () => {
    try {
      // Carregar agents salvos no Pulse
      const response = await fetch('/api/v1/prompt-engineering/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const checkSynexConnection = async () => {
    try {
      // Verificar conexão com Synex via Kosmos
      const response = await fetch('/api/v1/synex/status');
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.available_models || []);
      }
    } catch (error) {
      console.error('Synex connection failed:', error);
    }
  };

  // Gerenciamento de Ideas
  const addIdea = () => {
    if (currentInput.trim()) {
      const newIdea: Idea = {
        id: Date.now().toString(),
        text: currentInput.trim()
      };
      setIdeas([...ideas, newIdea]);
      setCurrentInput('');
    }
  };

  const removeIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingText.trim() && editingId) {
      setIdeas(ideas.map(idea =>
        idea.id === editingId
          ? { ...idea, text: editingText.trim() }
          : idea
      ));
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  // Geração de Prompts
  const generatePrompt = async () => {
    if (ideas.length === 0) return;

    setIsGenerating(true);
    try {
      const payload = {
        ideas: ideas.map(idea => idea.text),
        purpose: purpose === 'Outros' ? customPurpose : purpose,
        maxLength,
        agent: selectedAgent ? agents.find(a => a.id === selectedAgent) : null,
        model: selectedModel
      };

      const response = await fetch('/api/v1/synex/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPrompt(data.prompt);
      } else {
        throw new Error('Failed to generate prompt');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Fallback para demo
      generateDemoPrompt();
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDemoPrompt = () => {
    const demoPrompt = `## Prompt Estruturado

**Objetivo Principal:**
${purpose === 'Outros' ? customPurpose : purpose}

**Contexto:**
${ideas.map(idea => `• ${idea.text}`).join('\n')}

**Requisitos Técnicos:**
- Forneça explicações claras e detalhadas
- Use exemplos práticos quando aplicável
- Considere boas práticas da área
- Mantenha foco no objetivo principal

**Formato de Resposta:**
Estruture sua resposta de forma organizada, com seções claras e exemplos de código quando relevante.

${selectedAgent ? `**Especialista:** ${agents.find(a => a.id === selectedAgent)?.title}` : ''}`;

    setGeneratedPrompt(demoPrompt);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const clearAll = () => {
    setIdeas([]);
    setGeneratedPrompt('');
    setCurrentInput('');
    setPurpose('Desenvolvimento');
    setCustomPurpose('');
    setSelectedAgent('');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-accent to-primary p-3 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Prompt Engineering
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create structured prompts with AI assistance via Synex
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              title='Switch to Prompt Crafter'
              onClick={() => setActiveTab('crafter')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'crafter'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              <Wand2 className="w-4 h-4 mr-2 inline" />
              Prompt Crafter
            </button>
            <button
              title='Switch to AI Agents'
              onClick={() => setActiveTab('agents')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'agents'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
            >
              <Users className="w-4 h-4 mr-2 inline" />
              AI Agents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'crafter' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    title='Toggle Ideas & Requirements'
                    onClick={() => setIsInputCollapsed(!isInputCollapsed)}
                    className="flex items-center justify-between w-full"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Ideas & Requirements
                    </h2>
                    {isInputCollapsed ? <ChevronDown /> : <ChevronUp />}
                  </button>
                </div>

                {!isInputCollapsed && (
                  <div className="p-4 space-y-4">
                    {/* Add New Idea */}
                    <div className="flex gap-2">
                      <input
                        aria-placeholder='Add your idea or requirement...'
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Add your idea or requirement..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        onKeyPress={(e) => e.key === 'Enter' && addIdea()}
                      />
                      <button
                        title="Add idea"
                        onClick={addIdea}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Ideas List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {ideas.map((idea) => (
                        <div
                          key={idea.id}
                          className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          {editingId === idea.id ? (
                            <>
                              <input
                                aria-placeholder='Edit your idea...'
                                title='Edit idea'
                                name='editIdea'
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                              />
                              <button
                                onClick={saveEdit}
                                className="text-green-600 hover:text-green-700"
                                title="Save edit"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 hover:text-red-700"
                                title="Cancel edit"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                {idea.text}
                              </span>
                              <button
                                onClick={() => startEditing(idea.id, idea.text)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                title="Edit idea"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeIdea(idea.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Remove idea"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Purpose
                        </label>
                        <select
                          id='purpose'
                          name="purpose"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          title="Select purpose"
                        >
                          {purposes.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="maxLength"
                          data-tooltip-id="maxLengthTooltip"
                          title="Maximum length of the generated prompt"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          AI Agent (Optional)
                        </label>
                        <select
                          name="agent"
                          id="agent"
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          title="Select AI agent"
                        >
                          <option value="" disabled>No agent selected</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              {agent.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {purpose === 'Outros' && (
                      <input
                        name='customPurpose'
                        type="text"
                        value={customPurpose}
                        onChange={(e) => setCustomPurpose(e.target.value)}
                        placeholder="Specify custom purpose..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  title='Generate prompt'
                  onClick={generatePrompt}
                  disabled={ideas.length === 0 || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent to-primary text-white rounded-lg hover:from-accent-hover hover:to-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate Prompt'}
                </button>

                <button
                  title='Clear all inputs'
                  onClick={clearAll}
                  className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <button
                    title='Toggle Generated Prompt'
                    onClick={() => setIsOutputCollapsed(!isOutputCollapsed)}
                    className="flex items-center justify-between w-full"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Generated Prompt
                    </h2>
                    <div className="flex items-center gap-2">
                      {generatedPrompt && (
                        <button
                          onClick={copyToClipboard}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Copy to clipboard"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                      {isOutputCollapsed ? <ChevronDown /> : <ChevronUp />}
                    </div>
                  </button>
                </div>

                {!isOutputCollapsed && (
                  <div className="p-4">
                    {generatedPrompt ? (
                      <div className="space-y-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 border">
                          {generatedPrompt}
                        </pre>

                        <div className="flex gap-2">
                          <button
                            title='Copy generated prompt'
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Prompt'}
                          </button>

                          <button
                            title='Send prompt to AI'
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            Send to AI
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Your generated prompt will appear here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                AI Agents Management
              </h2>
              <button
                title='Create new AI Agent'
                onClick={() => setShowAgentForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Agent
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(agent => (
                <div key={agent.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {agent.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {agent.role}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-primary-subtle dark:bg-primary/20 text-primary-foreground dark:text-primary rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {agent.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{agent.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      title='Use this agent'
                      className="flex-1 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                    >
                      Use Agent
                    </button>
                    <button
                      title='Edit this agent'
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {agents.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No AI Agents Yet</h3>
                <p className="mb-4">Create specialized AI agents to improve your prompt engineering workflow.</p>
                <button
                  title='Create your first agent'
                  onClick={() => setShowAgentForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Create Your First Agent
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PromptEngineeringPage;
