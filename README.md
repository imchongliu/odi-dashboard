# China Outbound Investment Dashboard

A comprehensive web application for tracking and analyzing Chinese outbound direct investments (ODI) across the globe. The dashboard provides detailed insights into M&A transactions, greenfield investments, and other investment activities by Chinese listed companies worldwide.

## Overview

The China Outbound Investment Dashboard is an interactive data visualization platform that aggregates and presents investment data across multiple dimensions including investment type, destination country, industry sector, and temporal trends. The application enables stakeholders to explore investment patterns, identify key markets, and analyze investment distribution across different regions and sectors.

### Key Features

**Investment Data Visualization**
The dashboard displays comprehensive investment data through multiple visualization formats. Users can explore investment trends through interactive charts, geographic distribution maps, and detailed data tables. The platform aggregates investments by type (M&A, Greenfield, Other), destination country, and industry sector, providing a holistic view of China's outbound investment landscape.

**Geographic Analysis**
A static world map with interactive investment markers visualizes the global distribution of Chinese investments. Markers are dynamically sized based on investment amounts, allowing users to quickly identify major investment destinations. The map includes hover tooltips displaying destination-specific statistics including deal counts and total investment values.

**Deal Database**
The comprehensive deals database contains detailed information about individual investment transactions. Users can search, filter, and sort deals by investor, target company, destination, industry, and investment status. The database supports advanced filtering capabilities to enable targeted analysis of specific investment segments.

**Bilingual Support**
The application supports both English and Simplified Chinese interfaces, enabling users to interact with the platform in their preferred language. All content, labels, and navigation elements are fully translated and localized.

**Responsive Design**
The dashboard is optimized for desktop, tablet, and mobile devices, ensuring a consistent user experience across different screen sizes and devices.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | React 19 with TypeScript |
| Styling | Tailwind CSS 4 |
| Backend Framework | Express.js 4 |
| API Layer | tRPC 11 |
| Database | MySQL/TiDB |
| ORM | Drizzle ORM |
| State Management | React Query (TanStack Query) |
| Visualization | Recharts |
| UI Components | shadcn/ui |
| Build Tool | Vite |
| Testing | Vitest |
| Authentication | Manus OAuth |

## Project Structure

```
odi-dashboard/
├── client/                          # Frontend application
│   ├── public/                      # Static assets
│   │   └── world-map.jpg           # Static world map image
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── layout/             # Layout components (Header, Footer)
│   │   │   ├── destinations/       # Destination-specific components
│   │   │   ├── deals/              # Deal-related components
│   │   │   ├── charts/             # Chart components
│   │   │   ├── stats/              # Statistics components
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx            # Overview/Dashboard page
│   │   │   ├── Deals.tsx           # Deals database page
│   │   │   ├── Destinations.tsx    # Destinations analysis page
│   │   │   └── Insights.tsx        # M&A insights page
│   │   ├── contexts/               # React contexts
│   │   │   └── LanguageContext.tsx # Language/i18n context
│   │   ├── i18n/                   # Internationalization
│   │   │   ├── en.ts               # English translations
│   │   │   └── zh.ts               # Chinese translations
│   │   ├── lib/                    # Utility functions
│   │   │   ├── trpc.ts             # tRPC client setup
│   │   │   ├── api.ts              # API utilities
│   │   │   └── data.ts             # Data utilities
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # App entry point
│   │   └── index.css               # Global styles
│   └── index.html                  # HTML template
├── server/                          # Backend application
│   ├── _core/                      # Core server infrastructure
│   │   ├── index.ts                # Server entry point
│   │   ├── context.ts              # tRPC context
│   │   ├── oauth.ts                # OAuth authentication
│   │   ├── llm.ts                  # LLM integration
│   │   ├── imageGeneration.ts      # Image generation
│   │   ├── voiceTranscription.ts   # Voice transcription
│   │   ├── notification.ts         # Notification system
│   │   └── env.ts                  # Environment variables
│   ├── db.ts                       # Database query helpers
│   ├── routers.ts                  # tRPC procedure definitions
│   ├── storage.ts                  # S3 storage helpers
│   └── *.test.ts                   # Server tests
├── drizzle/                         # Database schema and migrations
│   ├── schema.ts                   # Database schema
│   ├── relations.ts                # Database relations
│   └── migrations/                 # Migration files
├── shared/                          # Shared utilities
│   ├── types.ts                    # Shared types
│   └── const.ts                    # Shared constants
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── vitest.config.ts                # Vitest configuration
├── drizzle.config.ts               # Drizzle configuration
└── README.md                       # This file
```

## Getting Started

### Prerequisites

- Node.js 22.13.0 or higher
- npm or pnpm package manager
- MySQL database or TiDB compatible database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd odi-dashboard
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=mysql://user:password@localhost:3306/odi_dashboard
JWT_SECRET=your-jwt-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
```

4. Initialize the database:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Development

### Running the Development Server

```bash
pnpm dev
```

This command starts both the Vite development server (frontend) and the Express backend server with hot module reloading.

### Building for Production

```bash
pnpm build
```

This command builds the frontend with Vite and bundles the backend server with esbuild.

### Running Tests

```bash
pnpm test
```

Execute the Vitest test suite to verify application functionality.

### Database Migrations

After modifying the database schema in `drizzle/schema.ts`, run:
```bash
pnpm db:push
```

This command generates and applies database migrations automatically.

### Code Formatting

```bash
pnpm format
```

Format all code files using Prettier to maintain consistent code style.

## Features in Detail

### Overview Dashboard

The home page provides a high-level summary of China's outbound investment activity. Key metrics displayed include total deal count, total investment value, top destination countries, and primary investment sectors. Interactive charts visualize monthly investment trends and distribution across investment types.

### Deals Database

The Deals page offers a comprehensive searchable and filterable database of individual investment transactions. Users can search by investor name, target company, or destination country. Advanced filtering options allow users to narrow results by investment type (M&A, Greenfield, Other), investment status, destination, and industry sector. The database displays detailed information for each transaction including announcement date, investor, target company, destination, industry, deal size, and status.

### Destinations Analysis

The Destinations page analyzes investment distribution across geographic regions. A world map with interactive markers visualizes the global spread of investments, with marker size indicating investment magnitude. A comprehensive table ranks destinations by deal count and total investment value. Users can click on destinations to view associated deals and investment details.

### M&A Insights

The Insights page provides specialized analysis of merger and acquisition activities. This page focuses specifically on M&A transactions, excluding greenfield investments and other investment types, to provide targeted insights into acquisition strategies and market consolidation trends.

## Internationalization

The application supports multiple languages through a context-based internationalization system. Language preferences are stored in the `LanguageContext` and can be toggled through the language selector in the header.

### Adding New Translations

1. Add translation keys to `client/src/i18n/en.ts` for English
2. Add corresponding translations to `client/src/i18n/zh.ts` for Chinese
3. Import the translation object in components and access translations via the `useLanguage()` hook

## API Documentation

The application uses tRPC for type-safe API communication between frontend and backend. All API procedures are defined in `server/routers.ts` and are automatically type-checked on both client and server.

### Available Procedures

The tRPC router exposes procedures for fetching investment data, filtering deals, and retrieving destination statistics. All procedures include proper error handling and authentication checks where applicable.

## Database Schema

The database schema is defined in `drizzle/schema.ts` and includes tables for storing investment records, user information, and application metadata. The schema uses Drizzle ORM for type-safe database operations.

## Authentication

The application uses Manus OAuth for user authentication. The OAuth flow is handled in `server/_core/oauth.ts` and provides secure user session management through HTTP-only cookies.

## Performance Optimization

**Static Asset Caching**
Static assets in `client/public` are served with aggressive caching. Filenames include content hashes to prevent stale asset issues.

**Database Query Optimization**
Database queries are optimized through proper indexing and query composition in `server/db.ts`.

**Frontend Rendering**
React Query manages server state efficiently, reducing unnecessary re-renders and API calls through intelligent caching strategies.

## Deployment

The application can be deployed to any Node.js hosting platform. The build output includes both the frontend static assets and the backend server bundle.

### Deployment Steps

1. Build the application:
```bash
pnpm build
```

2. Set production environment variables on your hosting platform

3. Start the server:
```bash
node dist/index.mjs
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

The project includes comprehensive test coverage using Vitest. Tests are located alongside source files with `.test.ts` extensions.

### Running Tests

```bash
pnpm test
```

### Writing Tests

Tests should cover critical business logic, API procedures, and utility functions. Use descriptive test names and organize tests into logical groups using `describe` blocks.

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors, verify that:
- The database server is running and accessible
- The `DATABASE_URL` environment variable is correctly configured
- Database credentials are valid

### Build Errors

If build errors occur, try:
1. Deleting `node_modules` and `pnpm-lock.yaml`
2. Running `pnpm install` to reinstall dependencies
3. Running `pnpm build` again

### Development Server Issues

If the development server fails to start:
1. Check that port 3000 is available
2. Verify all environment variables are set correctly
3. Restart the development server with `pnpm dev`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## MIT License

Copyright (c) 2026 China ODI Dashboard Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Support

For support, questions, or bug reports, please open an issue on the project repository or contact the development team.

## Acknowledgments

This project was developed using the Manus web development platform and leverages open-source libraries including React, Tailwind CSS, Express.js, tRPC, and Drizzle ORM.
