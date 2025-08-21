# Search Functionality Documentation

## Overview
A search function has been added to the Safety Week registration system that allows users to search for registrations by user ID or name.

## Features

### Backend Implementation

#### New API Endpoint
- **Route**: `POST /api/search-registrations`
- **Controller Method**: `WebController::searchRegistrations()`
- **Purpose**: Search for registrations by user ID or name

#### Search Logic
- Searches in both `userid` and `name` fields using SQL LIKE queries
- Case-insensitive search with partial matching
- Returns up to 50 results ordered by creation date (newest first)
- Only returns active registrations (not deleted)

#### Response Format
```json
{
  "success": true,
  "registrations": [
    {
      "id": 1,
      "userid": "user123",
      "name": "John Doe",
      "department": "IT",
      "register_type": "regular",
      "slot_title": "Safety Training",
      "time": "9:00 AM",
      "date": "Monday, January 15, 2024",
      "created_at": "2024-01-15 09:00:00"
    }
  ],
  "count": 1
}
```

### Frontend Implementation

#### Search Interface
- Located at the top of the main page after the header
- Modern card design with gradient background
- Search input field with placeholder text
- Search button with loading state
- Clear button to reset search results

#### Search Features
- **Real-time validation**: Requires at least 1 character to search
- **Enter key support**: Press Enter to search
- **Loading states**: Shows spinner during search
- **Error handling**: Displays error messages for failed searches
- **Results display**: Shows detailed registration information
- **No results handling**: Shows appropriate message when no results found

#### Search Results Display
Each result shows:
- User ID (with monospace font)
- Full name
- Department
- Registration type (Regular Employee or Outsource)
- Activity/slot title
- Date and time
- Registration timestamp

#### UI Components Used
- `Card`, `CardHeader`, `CardContent` for layout
- `Input` for search field
- `Button` for search and clear actions
- `Badge` for result count display
- `Search`, `X` icons from Lucide React

## Usage

### For Users
1. Navigate to the Safety Week registration page
2. Find the "ค้นหาการลงทะเบียน" (Search Registrations) section
3. Enter a user ID or name in the search field
4. Click "ค้นหา" (Search) or press Enter
5. View the search results below
6. Use "ล้าง" (Clear) to reset the search

### For Developers
The search functionality is fully integrated into the existing codebase:

- **Backend**: New method in `WebController.php`
- **Routes**: New route in `web.php`
- **Frontend**: New search section in `user-index.tsx`
- **Database**: Uses existing `UserSlotSelection` model

## Technical Details

### Database Query
```php
UserSlotSelection::with(['slot.time.date'])
    ->where('is_delete', false)
    ->where(function ($query) use ($search) {
        $query->where('userid', 'LIKE', "%{$search}%")
              ->orWhere('name', 'LIKE', "%{$search}%");
    })
    ->orderBy('created_at', 'desc')
    ->limit(50)
    ->get()
```

### Security Considerations
- Input validation on both frontend and backend
- SQL injection protection through Laravel's query builder
- Rate limiting can be added if needed
- Search results limited to 50 records to prevent performance issues

### Performance
- Uses database indexes on `userid` and `name` fields
- Eager loading of relationships to prevent N+1 queries
- Limited result set to prevent memory issues
- Efficient LIKE queries for partial matching

## Future Enhancements
- Add filters for date range, department, or registration type
- Implement pagination for large result sets
- Add export functionality for search results
- Add search history or recent searches
- Implement fuzzy search for better matching
