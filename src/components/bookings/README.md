# Bookings Management Feature

## Overview
The Bookings Management page allows villa administrators to view and filter all bookings for their villa.

## Features

### 📋 Booking List
- Display all bookings in a card-based layout
- Show guest information, dates, status, and payment details
- Include additional services and their costs
- Display booking timestamps and IDs

### 🔍 Filtering System
- **Villa ID**: Automatically set to current user's villa (required)
- **Start Date**: Filter bookings by check-in date (optional, YYYYMMDD format)
- **End Date**: Filter bookings by check-out date (optional, YYYYMMDD format)
- **Search Query**: Free text search across guest names, emails, and booking IDs (optional)
- **Pagination**: Configurable page size (5, 10, 20, 50 items per page)

### 📊 Booking Information Displayed
- Guest details (name, email, phone)
- Booking dates (check-in/check-out)
- Number of guests
- Booking status with color-coded badges
- Payment information (amount, currency, status)
- Additional services and their costs
- Creation and last update timestamps
- Booking ID for reference

### 🎨 Status Indicators
- **PENDING**: Yellow badge
- **CONFIRMED**: Green badge
- **CANCELLED**: Red badge
- **REJECTED**: Gray badge

## API Integration

### Endpoint
`GET /villa-bookings`

### Parameters
- `villaid` (required): Villa ID
- `startdate` (optional): Start date in YYYYMMDD format
- `enddate` (optional): End date in YYYYMMDD format
- `query` (optional): Free text search
- `page` (required): Page number
- `size` (required): Page size

### Response
Returns `PaginatedResponse<VillaBookingSummaryView>` containing:
- Booking data array
- Pagination metadata

## Navigation
The Bookings page is accessible from the main sidebar navigation with a book icon.

## Technical Implementation

### Components
- `BookingsManagementPage`: Main container component
- `BookingCard`: Individual booking display card
- `BookingsFilterForm`: Filter and search form
- `BookingStatusBadge`: Status indicator component
- `Pagination`: Page navigation component

### Hooks
- `useVillaBookings`: React Query hook for fetching bookings data
- Automatic villa ID detection from current user context

### Date Utilities
- `formatDisplayDate`: Format YYYYMMDD to readable date
- `formatDateTime`: Format timestamp to readable date/time
- `htmlDateToYYYYMMDD`: Convert HTML date input to API format
- `yyyymmddToHtmlDate`: Convert API date to HTML input format

## Usage
1. Navigate to "Bookings" from the sidebar
2. Use the filter form to narrow down results
3. View booking details in the card layout
4. Use pagination to navigate through results
5. Adjust page size as needed for optimal viewing