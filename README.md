# Villa Ekinoks Admin Dashboard

A Next.js 14 admin dashboard for villa management with TypeScript, SSR, React Query, and Axios.

## Features

- **Authentication**: Login page with form validation
- **Dashboard**: Overview with stats and recent bookings
- **Villa Management**: CRUD operations for villa listings
- **Server-Side Rendering**: All pages are server-side rendered
- **React Query**: Efficient data fetching and caching
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive UI
- **Form Validation**: Using React Hook Form with Zod schema validation

## Pages

1. **Login Page** (`/login`) - Authentication
2. **Dashboard** (`/dashboard`) - Admin overview with stats
3. **Villas** (`/villas`) - Villa listings management
4. **Villa Management** (`/villa-management/[id]`) - Add/Edit individual villas

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                      # Next.js 14 App Router pages
│   ├── dashboard/           # Dashboard page
│   ├── login/              # Login page
│   ├── villas/             # Villas listing page
│   ├── villa-management/   # Villa CRUD pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects to login)
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   ├── layout/            # Layout components (Sidebar)
│   ├── providers/         # React Query provider
│   └── ui/                # UI components (Button, Input, etc.)
├── hooks/                 # Custom React hooks
│   └── api.ts            # React Query hooks
├── lib/                  # Utility libraries
│   ├── api.ts           # Axios configuration
│   ├── services.ts      # API service functions
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
    └── index.ts        # All type definitions
```

## API Integration

The app is configured to work with a backend API. You'll need to implement the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get user profile

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

### Villas
- `GET /villas` - Get paginated villa list
- `GET /villas/:id` - Get villa by ID
- `POST /villas` - Create new villa
- `PUT /villas/:id` - Update villa
- `DELETE /villas/:id` - Delete villa
- `PATCH /villas/:id/toggle-status` - Toggle villa active status

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL

## Features Overview

### Authentication
- Secure login with email/password
- JWT token management
- Automatic token refresh
- Protected routes

### Dashboard
- Villa statistics overview
- Recent bookings display
- Revenue tracking
- Real-time data updates

### Villa Management
- Create new villa listings
- Edit existing villas
- Upload multiple images
- Manage amenities
- Set pricing and capacity
- Activate/deactivate listings

### UI/UX
- Responsive design
- Loading states
- Error handling
- Form validation
- Confirmation dialogs

## Development Notes

- All pages use SSR for better SEO and performance
- React Query handles data fetching, caching, and synchronization
- Forms use React Hook Form with Zod validation
- TypeScript ensures type safety throughout the application
- Tailwind CSS provides utility-first styling
- The app follows Next.js 14 App Router conventions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.