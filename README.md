# Running the Project

This project includes a frontend (Next.js) and a backend (Express + WebSocket). Both must be running in order to view the application. You can run them in development mode or production mode.

## Development Mode

### Start backend (runs on http://localhost:4000)

```bash
cd backend
npm install
npm run dev
```
### Start frontend (runs on http://localhost:3000)

```bash
cd frontend
npm install
npm run dev
``` 

## 🏗️ Production Mode

To run the project in production mode, you need to build the frontend and start the backend server.
### Build backend and start backend  (runs on http://localhost:4000)

```bash
cd backend
npm install
npm run build
npm run start
```
### Build and start frontend (runs on http://localhost:3000)

```bash
cd frontend
npm install   
npm run build
npm run start
```
