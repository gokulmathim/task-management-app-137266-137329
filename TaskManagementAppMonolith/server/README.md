# Express Backend for TaskManagementAppMonolith

## Running the backend

1. Install dependencies (from monolith root):
   ```
   npm install
   cd server && npm install express mongoose cors dotenv
   ```

2. Set up environment variables.
   Copy `.env.example` to `.env` and set variables as needed:
   ```
   cp ../.env.example ../.env
   ```

3. Start the backend server:
   ```
   npm run backend
   ```

The backend will run on `http://localhost:5000` by default.
