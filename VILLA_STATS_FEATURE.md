# Villa Stats Feature

## Overview
This feature displays dynamic villa statistics on the dashboard using data from the `/villa-stats` endpoint.

## Implementation

### 1. Types (`src/types/index.ts`)
- `VillaStat`: Represents a single statistic with id, value, color, prefix/suffix, and last update timestamp
- `Get_VillaStats_WC_MLS_XAction_Response`: API response wrapper for villa stats
- `VillaStatConstants`: Static constants matching the Java backend stat codes

### 2. API Service (`src/lib/services.ts`)
- `villaStatsApi.getVillaStats()`: Fetches villa statistics from `/villa-stats` endpoint

### 3. React Hook (`src/hooks/api.ts`)
- `useVillaStats()`: React Query hook with 5-minute refetch interval and 2-minute stale time

### 4. Utils (`src/lib/villa-stats-utils.ts`)
- `getStatTitle()`: Converts stat codes to user-friendly titles
- `formatStatValue()`: Formats values with prefix/suffix
- `getLastUpdateText()`: Human-readable "time ago" formatting
- `getStatColor()`: Color validation and fallback
- `sortVillaStats()`: Consistent ordering of stats

### 5. Component (`src/components/dashboard/VillaStatsCards.tsx`)
- Responsive grid layout for stat cards
- Loading and error states
- Icon mapping for different stat types
- Hover effects and animations

### 6. Dashboard Integration (`src/app/dashboard/page.tsx`)
- Separated villa stats from general villa information
- Added section headers for better organization

## Stat Codes Supported

| Stat Code | Title | Icon |
|-----------|-------|------|
| `bookings.total` | Total Bookings | Calendar |
| `bookings.nights.total` | Total Nights | Moon |
| `bookings.revenue.total` | Total Revenue | DollarSign |
| `villa.occupancy.rate` | Occupancy Rate | TrendingUp |

## Features

### Real-time Updates
- Automatic refresh every 5 minutes
- Loading states during fetch
- Error handling with user-friendly messages

### Visual Design
- Color-coded stats based on backend configuration
- Consistent iconography
- Responsive grid layout
- Hover effects and transitions

### Data Formatting
- Prefix/suffix support (e.g., "$", "%", "k")
- Time-since-update display
- Fallback for missing or invalid data

## API Contract

### Request
```
GET /villa-stats?villaid={villa_id}
Authorization: Bearer {token}
```

Note: The `villaid` parameter is automatically extracted from the authenticated user's villa information.

### Response
```typescript
{
  "code": 200,
  "message": "Success",
  "responsecode": "SUCCESS",
  "object": {
    "stats": [
      {
        "id": "stat-1",
        "lastupdate": 1697123456, // Unix timestamp
        "statcode": "bookings.total",
        "value": "42",
        "prefix": "",
        "suffix": "",
        "color": "#3B82F6"
      }
      // ... more stats
    ]
  }
}
```

## Error Handling
- Network errors show retry message
- Empty stats show "No statistics available"
- Invalid colors fall back to default gray
- Failed API calls are retried automatically by React Query

## Performance
- React Query caching prevents unnecessary API calls
- Component memoization for optimal re-renders
- Efficient sorting and filtering operations
- Minimal bundle size with selective imports