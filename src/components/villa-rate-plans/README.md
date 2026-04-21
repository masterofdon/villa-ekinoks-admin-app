# Villa Rate Plans Components

This directory contains components for managing villa rate plans, which allow dynamic pricing adjustments based on booking conditions.

## Components

### VillaRatePlansManagementPage
- Main page component for displaying and managing villa rate plans
- Supports bulk selection and deletion
- Shows rate plan cards with condition and application details
- Handles loading and error states

### CreateVillaRatePlanModal
- Modal form for creating new villa rate plans
- Validates form inputs including date ranges and numeric values
- Supports different condition types (guest count, stay duration)
- Allows various application methods (per guest, per day, etc.)

## Features

- **Condition Types**: Number of guests or number of nights
- **Condition Operators**: Equals, greater than, less than
- **Application Types**: Per guest, per day, or per guest per day
- **Value Types**: Percentage or fixed amount adjustments
- **Date Range**: Validity period for each rate plan
- **Bulk Operations**: Select and delete multiple rate plans

## Usage

Rate plans are automatically applied during booking calculations based on:
1. The booking date falling within the rate plan's validity period
2. The booking meeting the specified conditions (guest count or stay duration)
3. The adjustment being applied according to the configured method