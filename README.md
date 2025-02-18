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


# Live Data Button Functionality Summary

- **Initial State:**
  - Live mode is off by default.
  - Only historical API data is loaded.

- **Enabling Live Mode:**
  - Toggling the LIVE button sets `isLive` to `true`.
  - A WebSocket connection is established to receive new events in real time.
  - A one-time backlog fetch occurs: any events created after the latest timestamp in the current data (historical + frozen) are retrieved to fill in gaps.

- **Disabling Live Mode:**
  - Toggling the button off sets `isLive` to `false`.
  - The current live data is "frozen" to retain the snapshot.
  - The WebSocket connection is closed, stopping further live updates.

- **Data Merging & Sorting:**
  - Historical API data, backlog events, and live (or frozen) socket data are merged.
  - The combined data is deduplicated and sorted chronologically for a seamless display.

#  Adding and Using Distinct Data Fields in Mock Data  

##  1. Modify the `MockRecord` Interface  
- Add the new field in `types.ts` as optional (`?`) to ensure it only applies to relevant domains.  

##  2. Create a Generator Function  
- Define a function in `generateData.ts` to generate random values for the new field.  

##  3. Update `generateMockData()`  
- Add the new field conditionally based on `entityType` to ensure it appears only for the correct domain.  

## 4. Ensure Frontend Displays the Field  
- Modify `getColumns(domain)` in `EventTable.tsx` to dynamically include the field only for the relevant domain.  

This keeps the system **flexible and scalable** while ensuring each domain has its unique data fields.  

## Production deployment using Vercel and Railwind

