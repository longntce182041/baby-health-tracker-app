# Doctor Dashboard - Web Application

A modern, responsive doctor dashboard for the BabyCare telemedicine platform.

## Features

- **Dashboard Overview**: View key metrics including consultations, appointments, income, and ratings
- **Consultation Activity Chart**: Track consultation trends over time
- **Upcoming Appointments**: Manage scheduled patient consultations
- **Quick Actions**: Fast access to common tasks like managing schedules and viewing messages
- **Notifications**: Real-time alerts for important events and action items
- **Responsive Design**: Works seamlessly on desktop and tablet devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd doctor-wed
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit: `http://localhost:5173`

## Project Structure

```
doctor-wed/
├── src/
│   ├── DoctorDashboard.jsx    # Main dashboard component
│   ├── DoctorDashboard.css    # Dashboard styling
│   ├── App.jsx                 # App entry point
│   └── main.jsx                # React root
├── public/
└── package.json
```

## Features Overview

### Statistics Cards
- Today's Consultations
- This Week's Consultations
- This Month's Consultations
- Pending Consultations
- Current Income
- Average Rating

### Navigation
- Dashboard (active)
- Appointments
- Consultations
- Patients
- Reports
- Settings

### Consultation Activity
- Visual chart showing consultation trends
- Toggle between Daily, Weekly, and Monthly views

### Quick Actions
- Manage Schedule
- View Messages (with unread count)
- View Analytics
- Income Report

### Upcoming Appointments
- Patient information
- Consultation type (Video/Chat)
- Parent details
- Concern description
- Start consultation button

### Notifications
- Real-time alerts
- Urgent action items
- System updates
- Admin messages

## Design

This dashboard implements the design from Figma, featuring:
- Clean, modern interface
- Gradient accents (blue to teal)
- Responsive grid layouts
- Smooth transitions and hover effects
- Professional color scheme

## Technologies

- React 19.2.0
- Vite 8.0.0-beta
- Pure CSS (no external CSS frameworks)
- Modern ES6+ JavaScript

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Future Enhancements

- Connect to backend API
- Real-time data updates
- Video consultation integration
- Advanced analytics
- Mobile responsive improvements
- Dark mode support

## React + Vite

This template uses [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) for Fast Refresh.

## License

Private - BabyCare Platform

