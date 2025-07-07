# SHIELD - Athlete Tracking System

![SHIELD Logo](https://img.shields.io/badge/SHIELD-Athlete%20Tracking%20System-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A comprehensive web application for tracking and managing athlete performance, designed for teams and sports organizations. SHIELD provides separate dashboards for athletes, coaches, and administrators to streamline performance tracking and team management.

## Features

### For Athletes
- Personal dashboard with performance statistics
- View assigned tests and results
- Track progress over time
- Communicate with coaches

### For Coaches
- Manage multiple athletes
- Monitor athlete performance
- Assign and schedule tests
- Review detailed test results

### For Administrators
- Complete user management system
- Role-based access control
- System-wide statistics and reporting
- Configure test parameters and disciplines

## Technology Stack

- **Frontend**: React 19, React Router DOM 7
- **Build Tool**: Vite 6
- **CSS Framework**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Authentication**: JWT (JSON Web Token)
- **Code Quality**: ESLint

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/shield-athlete-tracking.git
   cd shield-athlete-tracking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:5173](http://localhost:5173).

## Build for Production

To build the application for production:

```bash
npm run build
```

The build will be available in the `dist` directory.

## Project Structure

```
shield-athlete-tracking/
├── public/                  # Static assets
├── src/
│   ├── assets/              # Images, fonts, and global styles
│   ├── components/          # Reusable UI components
│   │   └── core/            # Core UI components (navbar, footer, etc.)
│   ├── Pages/               # Page components
│   │   ├── AdminDashboard/  # Admin interface
│   │   ├── AthleteDashboard/# Athlete interface
│   │   ├── CoachDashboard/  # Coach interface
│   │   ├── Login/           # Authentication screens
│   │   └── UsersPanel/      # User management
│   ├── services/            # API services
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global CSS
├── .eslintrc.js             # ESLint configuration
├── package.json             # Project metadata and dependencies
├── vite.config.js           # Vite configuration
└── README.md                # Project documentation
```

## Authentication

The application uses JWT for authentication. Tokens are stored in localStorage and automatically included in API requests. The authentication service handles token refresh and user session management.

## User Roles

- **Athlete**: Regular users who can view their own performance data
- **Coach**: Can manage athletes and their performance data
- **Admin**: Full system access with user management capabilities

## Development Notes

### API Integration

The frontend expects a RESTful API at the URL specified in the `.env` file. The API service handles authentication, error handling, and request interceptors.



