# Serviceable Items Management

This module provides comprehensive management for villa serviceable items - additional services and amenities that guests can purchase.

## Components

### ServicableItemsManagementPage
Main management page that displays a list of all serviceable items with features:
- **List View**: Displays all serviceable items with pagination
- **Status Management**: Toggle between ACTIVE/INACTIVE status
- **Delete Functionality**: Remove serviceable items with confirmation
- **Statistics**: Shows total items, active/inactive counts
- **Responsive Design**: Works on desktop and mobile devices

### CreateServicableItemModal
Modal component for creating new serviceable items with form validation:
- **Name**: Service name (required)
- **Description**: Detailed service description (required) 
- **Icon URL**: Optional icon/image URL for the service
- **Unit**: Pricing unit (e.g., "per person", "per trip") (required)
- **Price**: Amount and currency (TRY, USD, EUR)
- **Quantity Limits**: Minimum and maximum quantities allowed

## API Integration

### Endpoints Used
- `GET /servicable-items` - Fetch paginated list of serviceable items
- `POST /servicable-items` - Create new serviceable item
- `PUT /servicable-items/:id/status` - Update item status
- `DELETE /servicable-items/:id` - Delete serviceable item

### Hooks Used
- `useServicableItems(page, size)` - Fetch paginated serviceable items
- `useCreateServicableItem()` - Create new serviceable item
- `useUpdateServicableItemStatus()` - Update item status
- `useDeleteServicableItem()` - Delete serviceable item

## Features

### Status Management
- **ACTIVE**: Item is available for booking
- **INACTIVE**: Item is temporarily disabled
- Status changes are reflected immediately with visual feedback

### Form Validation
- Required fields validation
- Price amount must be positive
- Maximum quantity must be >= minimum quantity
- Real-time error display

### Error Handling
- Network error handling with retry options
- User-friendly error messages
- Loading states for all operations

### Pagination
- Server-side pagination support
- Page navigation controls
- Configurable page size (default: 10 items per page)

## Navigation
The serviceable items management is accessible via:
- Sidebar navigation: "Serviceable Items"
- Direct URL: `/servicable-items`
- Protected by authentication guard

## Data Types

### ServicableItem
```typescript
{
  id: string;
  name: string;
  description: string;
  price: Price;
  iconlink: string;
  unit: string;
  minimum: number;
  maximum: number;
  status: ServicableItemStatus;
}
```

### Create_ServiceableItem_WC_MLS_XAction
```typescript
{
  villaid: string;
  name: string;
  description: string;
  iconlink: string;
  unit: string;
  price: Price;
  minimum: number;
  maximum: number;
}
```

## User Experience
- Clean, modern interface following existing design patterns
- Responsive grid layout for service cards
- Intuitive status indicators with icons and colors
- Confirmation dialogs for destructive actions
- Loading states and optimistic updates
- Auto-refresh after create/update/delete operations