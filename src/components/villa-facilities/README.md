# Villa Facilities Management

This module provides functionality for managing villa facilities in the admin application.

## Components

### VillaFacilitiesManagementPage
Main page component that displays the current villa facilities organized by category.

**Features:**
- Displays facilities grouped by category in a clean card layout
- Shows all facility items in a vertical list under each category heading
- Button to open modal for adding new facilities
- Loading and error states
- Automatic data refresh when facilities are added

### CreateVillaFacilityModal
Modal component for selecting and adding facilities from the facility pool.

**Features:**
- Lists all available facilities from the pool organized by category
- Checkbox selection for facilities
- Auto-checks facilities that are already added to the villa
- Multi-select support - user can select multiple facilities at once
- Save action to add selected facilities to the villa
- Loading states during save operation

## API Endpoints Used

### Get Villa Facilities
```
GET /villas/{id}/villa-facilities
```
Returns the current facilities of the villa organized by category.

**Response Type:** `Get_VillaFacilityItems_WC_MLS_XAction_Response`
```typescript
{
  [categoryName: string]: SimpleVillaFacilityItemView[];
}
```

### Get Available Facilities
```
GET /villa-facilities
```
Returns all available facilities from the facility pool.

**Response Type:** `Get_VillaFacilities_WC_MLS_XAction_Response`
```typescript
{
  [categoryName: string]: VillaFacilityCategoryMapView[];
}
```

### Add Facility to Villa
```
POST /villas/{id}/villa-facilities
```
Adds a facility from the pool to the villa.

**Request Body:** `Create_VillaFacilityItem_WC_MLS_XAction`
```typescript
{
  villafacilityid: string;
}
```

**Response:** `Create_VillaFacilityItem_WC_MLS_XAction_Response`
```typescript
{
  id: string;
}
```

## Usage

The page is accessible at `/villa-facilities` and is protected by `AuthGuard`.

```typescript
import { VillaFacilitiesManagementPage } from '@/components/villa-facilities';

// In your page component
<AuthGuard>
  <Sidebar>
    <VillaFacilitiesManagementPage />
  </Sidebar>
</AuthGuard>
```

## Data Flow

1. Page loads and fetches current villa facilities using `useVillaFacilityItems()` hook
2. Facilities are displayed grouped by category
3. When "Add Facilities" button is clicked, modal opens
4. Modal fetches available facilities using `useAvailableVillaFacilities()` hook
5. User selects/deselects facilities (already added ones are checked by default)
6. On save, each newly selected facility is added via `useCreateVillaFacilityItem()` hook
7. After successful save, the page automatically refreshes to show updated facilities

## Types

Key types used in this module:

- `SimpleVillaFacilityItemView` - Basic facility info (name, icon)
- `VillaFacilitySimpleView` - Full facility info from pool (id, name, description, priority)
- `VillaFacilityCategoryMapView` - Category mapping with priority and facilities
- `Get_VillaFacilityItems_WC_MLS_XAction_Response` - Response for villa's current facilities
- `Get_VillaFacilities_WC_MLS_XAction_Response` - Response for available facilities pool
