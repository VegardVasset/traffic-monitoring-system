# Summary of changes 01/02/2025 

## Backend Updates 🔧  
### API & WebSocket Setup  
- Created **API endpoints** to fetch initial event data:  
  - `GET /api/ferry`  
  - `GET /api/tires`  
  - `GET /api/vehicles`  
- Implemented **WebSocket server** to send real-time updates.  
- Clients subscribe **only to relevant data** (room-based WebSocket filtering).  
- **Optimized data broadcasting** so each client only receives updates for their domain (e.g., ferry page only gets ferry data).  

### Data Handling  
- **Mock database** initialized with **1000 records per entity**.  
- **Automated data generation** every 10 seconds.  
- **New events pushed to WebSocket clients in real-time**.  
- Implemented **unique ID handling** to prevent duplicate records.  

---

## Frontend Updates 🎨  
### Table Features  
- **Displays ferry, tire, and vehicle events dynamically.**  
- **Pagination, sorting, filtering, and column visibility toggling** added.  
- **Row selection** with checkboxes (sorting disabled for selection column).  
- **Three-way sorting** (ascending, descending, reset).  

### WebSocket Handling  
- **Real-time updates added without refreshing the page.**  
- **Optimized WebSocket state updates** to avoid excessive re-renders.  
- **Combined WebSocket and API data**, ensuring new events are added dynamically.  
- **Batch updates** to improve performance.  

---

## Current Status ✅  
✔ **Frontend and backend fully connected** via API and WebSockets.  
✔ **Table updates automatically when new data arrives**.  
✔ **Optimized WebSocket handling for better performance**.  
✔ **Pagination, sorting, filtering, and selection fully functional**.  


