# Price Tracker

A web application that tracks prices from various e-commerce websites (currently supporting Amazon and Flipkart) and notifies users when prices drop.

## Features

- Track product prices from Amazon and Flipkart
- User authentication and personalized tracking
- Price history visualization
- Email notifications for price drops
- Responsive modern UI

## Tech Stack

- Frontend:
  - React
  - Vite
  - Tailwind CSS
  - Axios

- Backend:
  - Node.js
  - Express
  - MongoDB
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/price-tracker.git
cd price-tracker
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory:
```
PORT=5050
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5050

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 