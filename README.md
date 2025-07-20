# Workflow Builder

## Overview

A React-based visual workflow builder application that allows users to create workflows with different types of nodes through a drag-and-drop interface.

``View the deployed project at https://workflow-frontend-challenge.vercel.app/``

## Features

- **Node Types**: Start, Form, Conditional, API, and End blocks
- **Visual Canvas**: ReactFlow-powered workflow canvas with drag-and-drop support
- **Block Panel**: Left sidebar with draggable workflow blocks
- **Modern UI**: Built with @radix-ui/themes design system
- **TypeScript**: Full TypeScript support throughout the application

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/ering30/workflow-frontend-challenge.git
   cd workflow-frontend-challenge
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run test package

## Tech Stack

- **React 18** with TypeScript
- **@radix-ui/themes** for UI components
- **ReactFlow** for workflow canvas
- **React Hook Form** for form management
- **Vite** for build tooling
- **Jest / Vitest / React Testing Library** for unit & integration tests

## Project Structure

```
src/
├── components/
│   ├── WorkflowEditor/          # Main workflow canvas
│   ├── BlockPanel/              # Left panel with draggable blocks
│   ├── DraggableBlockOverlay/   # Presentational components to enable dragging onto canvas
│   └── nodes/                   # Node components
│       ├── StartNode.tsx
│       ├── FormNode.tsx
│       ├── ConditionalNode.tsx
│       ├── ApiNode.tsx
│       └── EndNode.tsx
├── contexts/                    # Shared component data
├── hooks/                       # Component logic 
├── pages/
│   ├── Index.tsx                # App entry point
│   └── NotFound.tsx
└── main.tsx                     # App root file
├── tests/                       # Test suite
```
