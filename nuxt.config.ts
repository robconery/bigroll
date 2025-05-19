// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  content: {
    build: {
      markdown: {
        highlight: {
          // Theme used in all color schemes.
          theme: 'min-dark',
        }
      }
    }
  },
  modules: ['@nuxt/content', '@nuxt/scripts'],
  nitro: {
    firebase: {
      gen: 2
    }
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          sanitizeFileName: true,
        },
      },
    },
  },
  // Runtime config for environment variables
  runtimeConfig: {
  //   // Server-only environment variables
    firebaseAdmin: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    },
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  
  // Register global middleware for authentication
  routeRules: {
    // '/dashboard': { appMiddleware: ['auth'] },
    // '/invoice/**': { appMiddleware: ['auth'] },
  },
  
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width,initial-scale=1' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:type', content: 'website' },
        { name: 'description', content: 'Radical tutorials for self-taught programmers. Learn essential programming skills and concepts the fun way.' },
        { property: 'og:image', content: 'https://bigmachine.io/images/hero.png' },
        { name: 'msapplication-TileImage', content: '/images/suns.png' }
      ],
      link: [
        { rel: 'canonical', href: 'https://bigmachine.io/' },
        { rel: 'icon', href: '/images/suns.png', sizes: '32x32' },
        { rel: 'icon', href: '/images/suns.png', sizes: '192x192' },
        { rel: 'apple-touch-icon-precomposed', href: '/images/suns.png' },
        { rel: 'shortcut icon', href: '/images/suns.png' },
        // Google Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Righteous&family=Open+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap' },
        // CSS files
        { rel: 'stylesheet', href: '/js/vendor/font-awesome/css/all.min.css' },
        { rel: 'stylesheet', href: '/js/vendor/bootstrap-icons/bootstrap-icons.css' },
        { rel: 'stylesheet', href: '/js/vendor/tiny-slider/tiny-slider.css' },
        { rel: 'stylesheet', href: '/js/vendor/glightbox/css/glightbox.css' },
        { rel: 'stylesheet', href: '/css/style.css' },
        { rel: 'stylesheet', href: '/css/custom.css' }
      ],
      script: [
        { src: 'https://code.jquery.com/jquery-3.6.0.js' },
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js",
          type: "text/javascript",
        },
        { src: '/js/vendor/sticky-js/sticky.min.js', defer: true },
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-LRFHDFQ52H',
          async: true
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
          function gtag() { dataLayer.push(arguments); }
          gtag('js', new Date());
          gtag('config', 'G-LRFHDFQ52H');`,
          type: 'text/javascript'
        }
      ],
      title: 'Big Machine'
    }
  }
})