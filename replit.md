# SaaS Radar - Business Opportunity Discovery Platform

## Overview

SaaS Radar is a full-stack web application designed to help entrepreneurs and businesses discover SaaS opportunities by monitoring online communities and analyzing pain points. The platform uses AI to generate business ideas based on community discussions and provides real-time insights through a dashboard interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for client-side development
- **UI Framework**: Tailwind CSS with shadcn/ui component system
- **State Management**: React Query (@tanstack/react-query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: CSS variables-based theming system with dark mode support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage with plans for PostgreSQL sessions
- **AI Integration**: OpenAI API for generating SaaS ideas and analyzing pain points

### MCP Simulator Architecture (Added 2025-01-15)
- **Core Components**:
  - **MCP Simulator Service**: Executes MCP tools with parameter validation and result tracking
  - **Context Extractor**: Ghostwriter-style context extraction from multiple sources (file, git, API, database)
  - **GitHub PR Bot**: CI/CD integration for automatic PR analysis and MCP context injection
- **Tool System**: Extensible tool registration with JSON schema validation
- **Context Providers**: Pluggable providers for different data sources with caching support
- **Request Tracking**: Complete audit trail of all tool executions with timing and error handling

### Key Components

#### Database Schema
- **Opportunities**: Core business opportunities with scoring, categories, and metadata
- **Communities**: Tracked online communities (Reddit, Twitter, LinkedIn, HackerNews)
- **Pain Points**: Detected user frustrations and problems from communities
- **Activity Feed**: Real-time updates and system events
- **MCP Tools**: Configurable tools with JSON schema validation for parameter checking
- **MCP Context Providers**: Data source configurations for context extraction
- **MCP Requests**: Audit trail of all tool executions with results and timing
- **MCP Context Cache**: Cached context data with TTL support
- **GitHub PR Integrations**: PR analysis results and MCP context injection records

#### API Structure
- RESTful endpoints for CRUD operations on opportunities, communities, and pain points
- AI-powered endpoints for generating business ideas from pain points
- Activity feed for real-time updates
- Statistics endpoints for dashboard metrics
- MCP Tool management and execution endpoints (`/api/mcp/tools`)
- Context provider management and extraction endpoints (`/api/mcp/providers`)
- MCP request history tracking (`/api/mcp/requests`)
- Context cache search functionality (`/api/mcp/context/search`)
- GitHub webhook integration for PR analysis (`/api/github/webhook`)

#### Storage Layer
- Interface-based storage system with both in-memory and PostgreSQL implementations
- Drizzle ORM for type-safe database operations
- Migration system for schema changes

## Data Flow

1. **Community Monitoring**: System tracks specified online communities for pain points
2. **Pain Point Detection**: AI analyzes community discussions to identify user frustrations
3. **Opportunity Generation**: OpenAI API generates SaaS business ideas based on detected pain points
4. **Scoring System**: Opportunities are scored based on potential, competition, and market factors
5. **Dashboard Display**: Real-time dashboard shows opportunities, statistics, and activity feed
6. **User Interaction**: Users can filter, search, and manage opportunities through the interface

## External Dependencies

### Core Dependencies
- **OpenAI API**: For AI-powered business idea generation and pain point analysis
- **Neon Database**: Serverless PostgreSQL database hosting
- **Radix UI**: Headless component primitives for consistent UI behavior
- **Drizzle ORM**: Type-safe database operations and migrations

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server for frontend, tsx for backend hot-reloading
- **Environment Variables**: DATABASE_URL and OPENAI_API_KEY required
- **Type Checking**: Shared TypeScript configuration across client, server, and shared code

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Deployment**: Node.js production server serves both API and static files

### Architecture Decisions

1. **Monorepo Structure**: Single repository with client, server, and shared code for easier development and type safety
2. **Drizzle ORM**: Chosen for type safety and PostgreSQL compatibility over traditional ORMs
3. **React Query**: Selected for robust client-side state management and caching
4. **In-Memory Fallback**: Implemented for development and testing when PostgreSQL is unavailable
5. **shadcn/ui**: Provides consistent, accessible components with Tailwind CSS integration
6. **OpenAI Integration**: Leverages GPT-4 for intelligent business idea generation and analysis

The system is designed to be scalable, maintainable, and developer-friendly while providing real-time insights into SaaS business opportunities through AI-powered analysis.