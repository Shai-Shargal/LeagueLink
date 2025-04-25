# LeagueLink

LeagueLink is a modern web application designed to connect participants and facilitate team formation for any type of tournament or sports event. This platform helps organizers and participants manage tournaments, create teams, and coordinate events with a seamless user experience.

## 🚀 Features

### User Management

- Secure user authentication and authorization
- Profile customization with avatars and preferences
- User statistics and achievements tracking
- Role-based access control (Organizer, Admin, Participant)

### Team Management

- Create and manage teams
- Team chat and communication
- Team statistics and performance tracking
- Flexible team roles and permissions

### Communication

- Real-time chat channels
- Direct messaging between users
- Tournament announcements and updates
- Team coordination tools
- Event notifications and reminders

### Tournament Features

- Create and manage tournaments of any type
- Customizable tournament brackets
- Match scheduling and results tracking
- Prize pool and rewards management
- Multiple tournament formats support
- Automated bracket generation
- Score tracking and statistics

### Event Management

- Event registration and check-in
- Schedule management
- Venue information and maps
- Weather updates and alerts
- Equipment and resource management
- Volunteer coordination

## 🛠️ Tech Stack

### Frontend

- React.js with TypeScript
- Material-UI for modern UI components
- Socket.io-client for real-time communication
- React Router for navigation
- Redux for state management

### Backend

- Node.js with Express.js
- TypeScript for type safety
- MongoDB for database
- Socket.io for real-time features
- JWT for authentication
- Mongoose for MongoDB object modeling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm (v7 or higher) or yarn

## 🚀 Getting Started

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

### Environment Setup

1. Frontend Environment (.env):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

2. Backend Environment (.env):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leaguelink
JWT_SECRET=your_jwt_secret
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
LeagueLink/
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API and service functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── ll-channels/     # Channel-related components
│   │   ├── ll-tournament/   # Tournament-related components
│   │   └── App.tsx          # Main application component
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── app.ts           # Main application file
│   └── package.json
└── README.md
```

## 🤝 Contributing

This is a proprietary project. Please refer to the LICENSE file for information about usage and distribution rights.

## 📄 License

This project is proprietary software. All rights reserved. See the LICENSE file for details.

## 📞 Support

For support, please contact the development team or open an issue in the repository.
