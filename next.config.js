// next.config.js
/** @type {import('next').NextConfig} */
export default {
  trailingSlash: true,
  reactStrictMode: true,
  compress: true,
  cleanDistDir: true,
  staticPageGenerationTimeout: 60,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};


// export const cacheConfig = {
//   cacheHandler: null, // Disable default cache handler
//   cacheMaxMemorySize: 0, // disable default in-memory caching
// }

export const config = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', 'localhost', '127.0.0.1'],
  // Configurações de API limits
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
}

// This regex contains the bots that we need to do a blocking render for and can't safely stream the response
// due to how they parse the DOM. For example, they might explicitly check for metadata in the `head` tag, so we can't stream metadata tags after the `head` was sent.
// export const HTML_LIMITED_BOT_UA_RE =
//   /Mediapartners-Google|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti/i