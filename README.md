# LeagueLink

LeagueLink is a modern web application designed to connect gamers and facilitate team formation for competitive gaming. This project consists of a full-stack application with a React frontend and a Node.js backend.

## Features

- User authentication and profile management
- Team formation and management
- Real-time chat and communication
- Game-specific team matching
- Responsive and modern UI design

## Tech Stack

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- Socket.io-client

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Socket.io
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/LeagueLink.git
cd LeagueLink
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

4. Set up environment variables:

   - Create `.env` files in both frontend and backend directories
   - Copy the example environment variables and fill in your values

5. Start the development servers:

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

## Project Structure

```
LeagueLink/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
├── .gitignore        # Git ignore rules
└── LICENSE           # Proprietary license
```

## Contributing

This is a proprietary project. Please refer to the LICENSE file for information about usage and distribution rights.

## License

This project is proprietary software. All rights reserved. See the LICENSE file for details.

## Setup Instructions

### Firebase Configuration

1. Copy the Firebase configuration template:

```bash
cp frontend/src/config/firebase.template.ts frontend/src/config/firebase.ts
```

2. Update `frontend/src/config/firebase.ts` with your Firebase credentials:

- Replace `YOUR_API_KEY` with your Firebase API key
- Replace `your-project-id` with your Firebase project ID
- Replace other placeholder values with your actual Firebase configuration

Note: Never commit `firebase.ts` to version control as it contains sensitive information.

### Development

To start the development server with Firebase emulator:

```bash
cd frontend
npm run dev:firebase
```

This will start both:

- Frontend development server
- Firebase Storage emulator

Or run them separately:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Firebase Emulator
npm run emulator
```
