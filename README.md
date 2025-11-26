# Electronic Health Record System

A commercial electronic health record (EHR) system built with Next.js, TypeScript, and Tailwind CSS. This application provides comprehensive patient management capabilities, allowing healthcare providers to view patient lists and access detailed medical records.

## Features

- Patient list management with intuitive table layout
- Comprehensive patient detail pages with full medical information
- Seamless navigation between list and detail views
- RESTful API backend integration
- Responsive design optimized for desktop and mobile devices
- Modern UI built with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the backend API server (in a separate terminal):
```bash
npm run json-server
```

This will start the API server on `http://localhost:3001` serving the patient data from `db.json`.

3. Start the Next.js development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
narrative-ehr/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Patient list page
│   ├── globals.css        # Global styles
│   └── patients/
│       └── [id]/
│           ├── page.tsx   # Patient detail page
│           └── not-found.tsx
├── types/
│   └── patient.ts         # TypeScript interfaces
├── lib/
│   └── api.ts            # API client utilities
├── db.json               # Database file
└── package.json
```

## Sample Data

The development environment includes sample patient records for testing:
1. 山田 太郎 (Yamada Taro) - 80 years old, male
2. 佐藤 花子 (Sato Hanako) - 89 years old, female
3. 鈴木 次郎 (Suzuki Jiro) - 44 years old, male

## API Endpoints

The backend API provides the following endpoints:
- `GET /patients` - Retrieve all patients
- `GET /patients/:id` - Retrieve a specific patient by ID

## Development

- Run the development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Run linting: `npm run lint`

## Technologies Used

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- JSON Server


