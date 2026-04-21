# Parity Rates Management

This module provides comprehensive management of currency exchange rates (parity rates) for the villa management system.

## Features

- **View Parity Rates**: Display all currency exchange rates in a organized table format
- **Add New Parity Rates**: Create new currency exchange rate pairs
- **Multi-Currency Support**: Support for major global currencies
- **Real-time Updates**: Automatic refresh of parity rates data
- **Validation**: Form validation to ensure data integrity
- **Responsive Design**: Mobile-friendly interface

## Components

### ParityRatesManagementPage
The main management page that displays:
- Statistics cards showing total currency pairs and unique currencies
- Interactive table of all parity rates
- Add new parity rate functionality
- Empty state when no parity rates exist

### CreateParityRateModal
Modal component for creating new parity rates:
- Dropdown selection for source and target currencies
- Numeric input for exchange rate (up to 4 decimal places)
- Validation to prevent same currency pairs
- Informational tooltips and help text

## API Integration

### Endpoints
- `GET /parities` - Retrieves all parity rates
- `POST /parities` - Creates a new parity rate

### Data Types
- `Get_ParityRates_WC_MLS_XAction_Response`: Response containing rates object
- `Create_ParityRate_WC_MLS_XAction`: Request payload for creating parity rates
- `Create_ParityRate_WC_MLS_XAction_Response`: Response after creating a parity rate

## Usage

### Accessing the Page
Navigate to `/parity-rates` in the application. The page is accessible via the sidebar navigation.

### Adding a Parity Rate
1. Click "Add Parity Rate" button
2. Select source currency (From Currency)
3. Select target currency (To Currency) - must be different from source
4. Enter exchange rate in d.dddd format (up to 4 decimal places)
5. Click "Create Parity Rate"

### Data Format
Exchange rates are stored in decimal format with up to 4 decimal places precision.
Example: 1 USD = 0.8500 EUR means the rate is stored as "0.8500"

## Supported Currencies
The system supports major global currencies including:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- TRY (Turkish Lira)
- JPY (Japanese Yen)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- CHF (Swiss Franc)
- CNY (Chinese Yuan)
- And many more...

## Technical Notes

### State Management
- Uses React Query for data fetching and caching
- Automatic cache invalidation after successful operations
- Optimistic updates for better UX

### Error Handling
- Network error handling with user-friendly messages
- Form validation with real-time feedback
- Notification system for success/error states

### Performance
- 5-minute cache for parity rates data
- Lazy loading of components
- Efficient re-rendering with React Query

## Navigation
The parity rates page is accessible from the main sidebar navigation with an "ArrowLeftRight" icon, positioned between Villa Rate Plans and Discount Codes for logical grouping of financial management features.