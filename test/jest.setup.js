// jest.setup.js
// This file is used to set up the testing environment for Jest
// and can include global configurations, mocks, or any setup code needed before tests run.

// Import any necessary modules or libraries
import '@testing-library/jest-dom/extend-expect'; // For better assertions in tests
import 'jest-axe/extend-expect'; // For accessibility testing with jest-axe
import 'jest-fetch-mock';
import { configure } from 'jest-setup';

// Mocking global variables or functions for testing purposes
import { jest } from '@jest/globals';

// Mocking fetch API globally
global.fetch = require('jest-fetch-mock');

// Mocking console methods to prevent cluttering test output
// Mocking global functions or variables
// nana o o  commits: Math.floor(Math.random() * 500) + 100,
const generateGitHubStats = () => ({
  repositories: Math.floor(Math.random() * 100) + 10,
  contributors: Math.floor(Math.random() * 15) + 5,
  lastUpdated: new Date().toISOString()
});

clearImmediate(() => {
  global.fetch.resetMocks();
});

const generateAzureStats = () => ({
  failedPipelines: Math.floor(Math.random() * 5) + 1,
  runningPipelines: Math.floor(Math.random() * 5) + 1,
  workItems: Math.floor(Math.random() * 100) + 30,
  builds: Math.floor(Math.random() * 200) + 50,
  releases: Math.floor(Math.random() * 50) + 10,
  lastUpdated: new Date().toISOString()
});

const generateMCPServers = () => [
  {
    id: 'kosmos-1',
    name: 'Kosmos MCP Server',
    hostname: 'localhost:8000',
    status: Math.random() > 0.3 ? 'Online' : 'Offline',
    responseTime: Math.floor(Math.random() * 200) + 20,
    lastSeen: new Date(Date.now() - Math.random() * 300000).toISOString(), // Random within 5 minutes
    version: '1.0.0',
    capabilities: ['files', 'memory', 'tools', 'kubernetes'],
    endpoints: Math.floor(Math.random() * 20) + 8,
    activeConnections: Math.floor(Math.random() * 10) + 1,
    totalRequests: Math.floor(Math.random() * 1000) + 200,
    errors: Math.floor(Math.random() * 10)
  },
  {
    id: 'statusrafa-1',
    name: 'StatusRafa MCP Server',
    hostname: 'localhost:8001',
    status: Math.random() > 0.4 ? 'Online' : 'Offline',
    responseTime: Math.floor(Math.random() * 150) + 15,
    lastSeen: new Date(Date.now() - Math.random() * 180000).toISOString(), // Random within 3 minutes
    version: '0.9.5',
    capabilities: ['status', 'monitoring', 'alerts', 'notifications'],
    endpoints: Math.floor(Math.random() * 15) + 5,
    activeConnections: Math.floor(Math.random() * 8) + 1,
    totalRequests: Math.floor(Math.random() * 800) + 150,
    errors: Math.floor(Math.random() * 5)
  },
  {
    id: 'local-mock-1',
    name: 'Local Mock Server',
    hostname: 'localhost:3002',
    status: 'Online',
    responseTime: Math.floor(Math.random() * 100) + 25,
    lastSeen: new Date().toISOString(),
    version: '1.0.0-mock',
    capabilities: ['mock', 'testing', 'development', 'api'],
    endpoints: 6,
    activeConnections: Math.floor(Math.random() * 5) + 1,
    totalRequests: Math.floor(Math.random() * 500) + 100,
    errors: 0
  }
];

global.console = {
  ...console,
  log: jest.fn(), // Mock console.log
  error: jest.fn(), // Mock console.error
  warn: jest.fn(), // Mock console.warn
  info: jest.fn(), // Mock console.info
  debug: jest.fn(), // Mock console.debug
  generateAzureStats,
  generateGitHubStats,
  generateMCPServers
};

// Configure Jest with any necessary settings
configure({
  testEnvironment: 'jsdom', // Use jsdom for browser-like environment
  setupFilesAfterEnv: ['./jest.setup.js'], // Specify the setup file
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: 'coverage', // Directory for coverage reports
  coverageReporters: ['text', 'lcov'], // Report formats
  testTimeout: 30000, // Set a timeout for tests
  verbose: true // Enable verbose output
});

function test() {
  console.log('Jest setup complete. All global mocks and configurations are ready for testing.');
}

test();

module.exports = {
  generateGitHubStats,
  generateAzureStats,
  generateMCPServers
};

// Export the setup functions for use in tests
module.exports.setup = () => {
  global.githubStats = generateGitHubStats();
  global.azureStats = generateAzureStats();
  global.mcpServers = generateMCPServers();
}

// Automatically run the setup function to initialize global variables
module.exports.setup();
// This ensures that the global variables are available in all test files

console.log('Global variables for GitHub, Azure, and MCP servers have been initialized.');
// You can now use global.githubStats, global.azureStats, and global.mcpServers in your tests.
