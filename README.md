# Denish - Food Delivery & Vendor Platform

Denish is a comprehensive food delivery ecosystem designed for the Nigerian market. It supports three distinct user roles: **Vendors**, **Customers**, and **Drivers**, each with their own specialized dashboards and workflows.

## 🚀 Key Features

### 🏪 Vendor Management
*   **Role-Based Onboarding**: A 5-step intuitive wizard for vendor registration.
*   **Business Profile**: Integrated with Cloudinary for secure Logo and Cover Page image management.
*   **Flexible Operations**: Custom opening hours with easy status toggles (Open/Closed).
*   **Real-time Validation**: Instant feedback on email, phone, and form completion.
*   **Category Selection**: Specialized categories for the Nigerian food industry (Local Dishes, Suya Spots, etc.).

### 📱 Core Application Features
*   **Multi-Role Switcher**: Seamless entry for Customers, Vendors, and Drivers from the welcome screen.
*   **Production API**: Connected to a high-availability Railway backend.
*   **Secure Auth**: Backend-integrated login and signup systems.
*   **Animated UI**: Smooth loading feedback and professional design aesthetics.

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 51+)
- **Backend**: Node.js & Express
- **Database**: MongoDB (Production)
- **Cloud Storage**: Cloudinary (Image management)
- **Navigation**: React Navigation (Stack, Bottom Tabs)
- **API Client**: Axios

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aminumuhammad000/Denish.git
   cd Denish
   ```

2. **Setup the Mobile App**
   ```bash
   cd app
   npm install
   npx expo start
   ```

3. **Setup the Server (Local Development)**
   ```bash
   cd server
   npm install
   # Create a .env file with your MONGO_URI and CLOUDINARY keys
   npm start
   ```

## 🌐 API Configuration
The app is currently configured to use the production server:
`https://denish-production.up.railway.app/api`

## 📄 License
This project is proprietary and for internal use only.
