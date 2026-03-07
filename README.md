# Hardware Hub Simple - Pahala Store

A modern, responsive e-commerce web application for an online hardware store built with React and TypeScript.

## Overview

Hardware Hub Simple (Pahala Store) is a full-featured e-commerce platform designed for hardware stores. The application provides a seamless shopping experience for customers and comprehensive management tools for administrators.

## Features

### Customer Features
- **Product Browsing**: Browse products across multiple categories (Tools, Electrical, Plumbing, Paint, Building, Garden)
- **Product Search**: Search and filter products by category and keywords
- **Product Details**: View detailed product information including descriptions, prices, and stock availability
- **Shopping Cart**: Add products to cart with quantity management
- **Checkout**: Complete orders with customer information and delivery details
- **Order Tracking**: View order history and track order status
- **WhatsApp Integration**: Quick contact support via WhatsApp button

### Admin Features
- **Admin Dashboard**: Overview of sales, orders, and inventory
- **Product Management**: Add, edit, and manage product listings
- **Order Management**: View and manage customer orders
- **Inventory Tracking**: Monitor stock levels across all products

## Technology Stack

- **Frontend Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **UI Components**: shadcn-ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Icons**: Bootstrap Icons & Lucide React
- **Form Management**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Testing**: Vitest with Testing Library

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/hudihi/hardware-hub-simple.git
cd hardware-hub-simple
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development environment
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/       # Reusable UI components
├── context/         # React Context providers (Cart, Auth, Orders)
├── data/            # Static data and product catalog
├── hooks/           # Custom React hooks
├── pages/           # Page components and routes
│   ├── admin/      # Admin panel pages
│   └── ...         # Customer-facing pages
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── lib/            # Third-party library configurations
```

## Deployment

To build the application for production:

```bash
npm run build
```

The build output will be in the `dist/` directory, ready to be deployed to any static hosting service such as:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any other static hosting provider

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
