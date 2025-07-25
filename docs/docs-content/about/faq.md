# Frequently Asked Questions

Common questions and answers about Kortex, troubleshooting, and best practices.

## 🚀 Getting Started

### Q: What is Kortex?

**A:** Kortex is a modern web dashboard for managing and monitoring MCP (Model Context Protocol) servers. It provides real-time monitoring, integration with GitHub and Azure DevOps, and a comprehensive interface for managing distributed server infrastructure.

### Q: What are the system requirements?

**A:**

- **Browser**: Modern web browser with JavaScript enabled (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Node.js**: Version 18.0 or higher for development
- **Memory**: 512MB RAM minimum for optimal performance
- **Network**: Internet connection for GitHub/Azure DevOps integrations

### Q: Can I use Kortex without external integrations?

**A:** Yes! Kortex works as a standalone MCP server monitor. GitHub and Azure DevOps integrations are optional features that enhance functionality but aren't required for basic server monitoring.

### Q: Is Kortex free to use?

**A:** Yes, Kortex is open-source and free to use. You can deploy it anywhere without licensing costs. However, you may incur costs from hosting providers (Vercel, AWS, etc.) and API usage from GitHub/Azure DevOps.

## 🔧 Installation & Setup

### Q: How do I install Kortex?

**A:** There are several installation methods:

1. **Clone and run locally**:

   ```bash
   git clone https://github.com/your-org/kortex.git
   cd kortex
   npm install
   npm run dev
   ```

2. **Deploy to Vercel** (recommended):

   ```bash
   vercel --prod
   ```

3. **Docker deployment**:

   ```bash
   docker run -p 3000:3000 kortex:latest
   ```

### Q: The build fails with "Module not found" errors. How do I fix this?

**A:** This usually indicates missing dependencies or incorrect paths:

1. **Clear cache and reinstall**:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check TypeScript paths**:

   ```bash
   npm run type-check
   ```

3. **Verify all imports** use correct relative paths

### Q: Environment variables aren't being loaded. What's wrong?

**A:** Common causes and solutions:

1. **File naming**: Ensure it's named `.env.local` (not `.env`)
2. **Prefix required**: Variables must start with `NEXT_PUBLIC_` for client-side
3. **Restart required**: Restart dev server after changing env vars
4. **Location**: File must be in project root directory

Example correct `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_WS_URL=ws://localhost:3002/ws
GITHUB_TOKEN=ghp_your_token_here
```

## 🔌 Integrations

### Q: How do I get a GitHub Personal Access Token?

**A:**

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select scopes: `repo`, `user`, `read:org`, `workflow`
4. Copy the token and add it to your `.env.local` file

**Note**: Never commit tokens to your repository. Use environment variables only.

### Q: GitHub API rate limits are too restrictive. What can I do?

**A:** Several strategies to manage rate limits:

1. **Increase polling intervals**:

   ```javascript
   // Increase from 1 minute to 5 minutes
   const POLL_INTERVAL = 5 * 60 * 1000;
   ```

2. **Use GraphQL API** for more efficient queries
3. **Implement caching** to reduce API calls
4. **Use webhooks** instead of polling when possible

### Q: Azure DevOps integration isn't working. How do I troubleshoot?

**A:** Common issues and fixes:

1. **Verify PAT permissions**:
   - Build (read)
   - Project and team (read)
   - Work Items (read)

2. **Check organization name**:

   ```bash
   # Test connection
   curl -u ":$AZURE_DEVOPS_TOKEN" \
     https://dev.azure.com/$ORGANIZATION/_apis/projects?api-version=7.0
   ```

3. **Verify project access**: Ensure your PAT has access to the specific project

## 🖥️ WebSocket & Real-time Features

### Q: WebSocket connection keeps disconnecting. How do I fix this?

**A:** Several possible causes and solutions:

1. **Proxy/firewall issues**:
   - Check if WebSockets are blocked
   - Try different ports or protocols (ws vs wss)

2. **Network stability**:
   - Implement connection retry logic
   - Use longer heartbeat intervals

3. **Server configuration**:

   ```javascript
   // Increase connection timeout
   const ws = new WebSocket(url, {
     handshakeTimeout: 10000,
     perMessageDeflate: false
   });
   ```

### Q: Real-time updates are delayed or not working?

**A:** Troubleshooting steps:

1. **Check WebSocket status**:

   ```javascript
   console.log('WebSocket state:', ws.readyState);
   // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
   ```

2. **Verify server-side events** are being sent
3. **Check browser console** for errors
4. **Test with browser dev tools** → Network tab → WS filter

### Q: Can I use Kortex without WebSockets?

**A:** Yes, you can disable WebSockets and use polling instead:

```env
NEXT_PUBLIC_ENABLE_WEBSOCKETS=false
NEXT_PUBLIC_POLLING_INTERVAL=30000  # 30 seconds
```

However, real-time features will be limited to polling intervals.

## 🎨 Customization & Development

### Q: How do I customize the theme or colors?

**A:** Kortex uses Tailwind CSS. You can customize colors in several ways:

1. **Modify tailwind.config.js**:

   ```javascript
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: '#your-color',
           secondary: '#your-color'
         }
       }
     }
   }
   ```

2. **Use CSS custom properties**:

   ```css
   :root {
     --primary-color: #3B82F6;
     --secondary-color: #10B981;
   }
   ```

### Q: Can I add custom dashboard widgets?

**A:** Yes! Create custom components and integrate them:

```typescript
// components/CustomWidget.tsx
export const CustomWidget: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3>Custom Widget</h3>
      {/* Your custom content */}
    </div>
  );
};

// Add to dashboard
import { CustomWidget } from './components/CustomWidget';

const Dashboard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <CustomWidget />
    {/* Other widgets */}
  </div>
);
```

### Q: How do I add support for other version control systems?

**A:** To add support for GitLab, Bitbucket, etc.:

1. **Create integration file**:

   ```typescript
   // lib/gitlab-integration.ts
   export class GitLabIntegration {
     // Implementation similar to GitHubIntegration
   }
   ```

2. **Add to context**:

   ```typescript
   // context/AppContext.tsx
   const [gitlabData, setGitlabData] = useState();
   ```

3. **Create UI components** for the new integration

## 🔒 Security & Privacy

### Q: Is it safe to store API tokens in environment variables?

**A:** For local development, yes. For production:

1. **Use secure secret management**:
   - Vercel: Environment Variables
   - AWS: Secrets Manager
   - Azure: Key Vault
   - Google Cloud: Secret Manager

2. **Never commit tokens** to version control
3. **Rotate tokens regularly**
4. **Use minimal required permissions**

### Q: Does Kortex collect any user data?

**A:** No, Kortex is a client-side application that:

- Runs entirely in your browser or on your infrastructure
- Only communicates with APIs you configure
- Doesn't send data to external analytics services
- Stores preferences locally in browser storage

### Q: How do I secure my Kortex deployment?

**A:** Security best practices:

1. **Use HTTPS** in production
2. **Implement authentication** if needed:

   ```javascript
   // Example: Basic auth middleware
   export function authMiddleware(req, res, next) {
     // Your authentication logic
   }
   ```

3. **Restrict network access** using firewalls
4. **Keep dependencies updated**:

   ```bash
   npm audit
   npm update
   ```

## 🚀 Performance & Scaling

### Q: Kortex is slow or unresponsive. How do I optimize performance?

**A:** Performance optimization strategies:

1. **Reduce API polling frequency**:

   ```env
   NEXT_PUBLIC_POLLING_INTERVAL=300000  # 5 minutes instead of 1 minute
   ```

2. **Enable caching**:

   ```javascript
   // Cache API responses
   const cache = new Map();
   
   const getCachedData = async (key, fetcher, ttl = 300000) => {
     const cached = cache.get(key);
     if (cached && Date.now() - cached.timestamp < ttl) {
       return cached.data;
     }
     
     const data = await fetcher();
     cache.set(key, { data, timestamp: Date.now() });
     return data;
   };
   ```

3. **Limit concurrent requests**
4. **Use lazy loading** for components

### Q: Can Kortex handle multiple organizations or projects?

**A:** Yes, but it requires configuration:

1. **Multiple GitHub repos**:

   ```javascript
   const repos = [
     { owner: 'org1', repo: 'repo1' },
     { owner: 'org2', repo: 'repo2' }
   ];
   ```

2. **Multiple Azure projects**:

   ```javascript
   const projects = ['project1', 'project2', 'project3'];
   ```

3. **Consider performance impact** of monitoring multiple sources

### Q: How do I monitor Kortex itself?

**A:** Implement monitoring for your Kortex deployment:

1. **Health check endpoint**:

   ```typescript
   // pages/api/health.ts
   export default function handler(req, res) {
     res.status(200).json({ 
       status: 'healthy',
       timestamp: new Date().toISOString()
     });
   }
   ```

2. **Use uptime monitoring** services like Pingdom, UptimeRobot
3. **Implement error tracking** with Sentry or similar
4. **Monitor performance** with tools like New Relic

## 🔄 Deployment & Updates

### Q: How do I update Kortex to the latest version?

**A:** Update process depends on deployment method:

1. **Local development**:

   ```bash
   git pull origin main
   npm install
   npm run build
   ```

2. **Vercel deployment**:

   ```bash
   git push origin main  # Auto-deploys on push
   ```

3. **Docker deployment**:

   ```bash
   docker pull kortex:latest
   docker stop kortex
   docker run -d --name kortex kortex:latest
   ```

### Q: Can I run multiple instances of Kortex?

**A:** Yes, for high availability:

1. **Load balancer setup**:

   ```nginx
   upstream kortex {
     server kortex-1:3000;
     server kortex-2:3000;
     server kortex-3:3000;
   }
   ```

2. **Shared state considerations**: Each instance maintains its own local state
3. **Database for shared data** if needed across instances

### Q: How do I backup Kortex configuration?

**A:** Backup important configuration:

1. **Environment variables**:

   ```bash
   # Export current env vars
   env | grep NEXT_PUBLIC > kortex-config-backup.env
   ```

2. **Custom configuration files**
3. **User preferences** (stored in browser localStorage)

## 🐛 Troubleshooting

### Q: "Cannot connect to server" error. What should I check?

**A:** Systematic troubleshooting:

1. **Verify server is running**:

   ```bash
   curl http://localhost:3002/health
   ```

2. **Check network connectivity**
3. **Verify URLs in environment variables**
4. **Check firewall settings**
5. **Look at browser console** for detailed errors

### Q: GitHub/Azure data isn't updating. How do I debug?

**A:** Debug steps:

1. **Check API credentials**:

   ```bash
   # Test GitHub
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   
   # Test Azure DevOps
   curl -u ":$AZURE_DEVOPS_TOKEN" \
     https://dev.azure.com/$ORG/_apis/projects?api-version=7.0
   ```

2. **Check rate limits**:

   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/rate_limit
   ```

3. **Enable debug logging**:

   ```env
   NEXT_PUBLIC_DEBUG_MODE=true
   ```

### Q: Build fails on deployment. Common causes?

**A:** Most common build issues:

1. **TypeScript errors**:

   ```bash
   npm run type-check
   ```

2. **Missing environment variables** in production
3. **Dependency version conflicts**:

   ```bash
   npm ls --depth=0
   ```

4. **Memory limits** on deployment platform

### Q: Where can I get help if I'm still stuck?

**A:** Available support channels:

1. **GitHub Issues**: Report bugs and feature requests
2. **Discussions**: Community support and questions
3. **Documentation**: Check all sections for detailed guidance
4. **Debug Mode**: Enable verbose logging for troubleshooting

---

*Still need help? Check our [troubleshooting guide](../guide/troubleshooting.md) or [open an issue](https://github.com/your-org/kortex/issues) on GitHub.*
