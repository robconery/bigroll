# Big Machine

Radical tutorials for self-taught programmers. Learn essential programming skills and concepts the fun way.

This project is a content-driven website built with Nuxt 3 and Nuxt Content, deployed on Firebase.

## Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/)
- **Content**: [Nuxt Content](https://content.nuxt.com/)
- **Hosting & Backend**: [Firebase](https://firebase.google.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **CSS Frameworks/Libraries**: Bootstrap, Font Awesome
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc` if available, otherwise latest LTS)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd app
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the project and add the following environment variables. You can get these values from your Firebase and Stripe dashboards.

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Development

To run the development server, use the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run build`: Builds the application for production.
- `npm run dev`: Starts the development server.
- `npm run generate`: Generates a static version of the site.
- `npm run preview`: Previews the production build locally.
- `npm run postinstall`: Runs after `npm install` to prepare the Nuxt application.
- `npm run deploy`: Builds the application and deploys it to Firebase.
- `npm test`: Runs the test suite using Jest.
- `npm run test:watch`: Runs the test suite in watch mode.
- `npm run update-post-dates`: A utility script to update dates in posts.
- `npm run rename-posts`: A utility script to rename posts based on their date.

## Deployment

This project is configured for deployment to Firebase. To deploy the application, run the following command:

```bash
npm run deploy
```

This will build the Nuxt application and then deploy it using the Firebase CLI.
