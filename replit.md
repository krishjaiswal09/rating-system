# Overview

This is a full-stack store rating application built as an intern coding challenge project that meets all specified requirements. The system allows users to register, log in, and submit ratings for stores with comprehensive role-based access control. It supports three user roles: Admin (full system management with user/store creation), Normal User (store browsing, rating, password updates), and Store Owner (view ratings and store analytics). The application features a clean, modern interface using React with shadcn/ui components, implements secure bcrypt authentication, and includes all required form validations and RESTful APIs.

# User Preferences

Preferred communication style: Simple, everyday language.
Latest update: Completed comprehensive requirements review and ensured full compliance:
- ✅ Fixed validation rules: Name 20-60 chars, password 8-16 with uppercase+special, address max 400 chars
- ✅ Added password update functionality for all user roles
- ✅ Implemented filtering and sorting for all tables as required
- ✅ Ensured all form validations match exact requirements specification
- ✅ Added comprehensive search functionality for stores by name and address
- ✅ Maintained simplified project structure with clean, focused code
- Project now fully meets all intern coding challenge requirements with proper validations

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and better development experience
- **UI Library**: shadcn/ui components built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js for REST API endpoints
- **Language**: TypeScript for full-stack type safety
- **Session Management**: Express-session with secure cookie configuration
- **Password Security**: bcrypt for password hashing with salt rounds
- **Middleware**: Role-based authentication and authorization middleware
- **Error Handling**: Centralized error handling with structured responses

## Database Layer
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Database**: PostgreSQL with Neon serverless for scalable cloud deployment
- **Schema**: Well-defined relational schema with users, stores, and ratings tables
- **Migrations**: Drizzle Kit for database schema migrations and version control

## Authentication & Authorization
- **Strategy**: Session-based authentication with secure server-side session storage
- **Role System**: Three-tier role system (admin, user, store_owner) with middleware protection
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration
- **Password Policy**: bcrypt hashing with 8-16 character requirement, 1 uppercase + 1 special character
- **Form Validations**: Name 20-60 chars, Address max 400 chars, Email validation per requirements

## API Design
- **Architecture**: RESTful API design with resource-based endpoints
- **Data Validation**: Zod schema validation for request/response data integrity
- **Error Responses**: Standardized error format with proper HTTP status codes
- **Middleware Stack**: Authentication, authorization, logging, and error handling layers

# External Dependencies

## Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect for database operations
- **@tanstack/react-query**: Server state management and caching for React frontend
- **express-session**: Session middleware for Express.js authentication
- **bcrypt**: Secure password hashing for authentication system

## UI & Styling
- **@radix-ui/***: Comprehensive set of low-level UI primitives for accessible components
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library with consistent React components

## Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-***: Replit-specific plugins for development environment integration
- **wouter**: Minimalist routing library for React applications

## Security & Validation
- **bcrypt**: Password hashing library for secure authentication
- **zod**: Schema validation library for runtime type checking
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation