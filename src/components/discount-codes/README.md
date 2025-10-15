# Discount Codes Management

This component provides a complete discount codes management system for villa bookings.

## Features

### List View
- **Statistics Cards**: Shows total codes, active codes, percentage codes, and fixed amount codes
- **Discount Code Cards**: Displays each discount code with:
  - Code string in monospace font
  - Discount type icon (% or $)
  - Discount value with proper formatting
  - Status badge (Active, Inactive, Expired)
  - Usage type badge (Single Use, Multi Use)
  - Creation and expiration dates
  - Creator information

### Create New Discount Code
- **Modal Form** with the following fields:
  - **Discount Type**: Percentage or Fixed Amount (visual button selection)
  - **Discount Value**: Numeric input with validation
    - Percentage: 0-100%
    - Fixed Amount: Any positive dollar amount
  - **Usage Type**: Single Use or Multi Use (visual button selection)
  - **Expiration Date**: Date picker (must be future date)

### Validation
- Discount value must be positive
- Percentage discounts cannot exceed 100%
- Expiration date must be in the future
- Form validation with error messages

### API Integration
- **GET /discount-codes**: Fetches all discount codes for the villa
- **POST /discount-codes**: Creates a new discount code
- Automatic refetch after successful creation
- Villa ID automatically populated from authenticated user

## Types Used

- `DiscountCode`: Main discount code object
- `DiscountType`: "PERCENTAGE" | "FIXED_AMOUNT"
- `DiscountCodeStatus`: "ACTIVE" | "INACTIVE" | "EXPIRED"
- `DiscountCodeUsageType`: "SINGLE_USE" | "MULTI_USE"
- `Create_DiscountCode_WC_MLS_XAction`: API request body for creation
- `Get_DiscountCode_WC_MLS_XAction_Response`: API response for listing

## Navigation

The discount codes page is accessible via:
- URL: `/discount-codes`
- Sidebar: "Discount Codes" menu item with Percent icon

## Components

- `DiscountCodesManagementPage`: Main page component
- `CreateDiscountCodeModal`: Modal form for creating new codes
- `DiscountCodeCard`: Individual code display component
- Various badge components for status and usage type display

## Authentication

- Protected by `AuthGuard` component
- Requires authenticated user with villa data
- Villa ID automatically extracted from user context