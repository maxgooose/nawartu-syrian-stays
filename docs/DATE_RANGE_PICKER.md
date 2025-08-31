# Date Range Picker Component

## Overview

The Date Range Picker is a new, beautiful, and user-friendly component designed to replace the old separate check-in and check-out date pickers. It provides an Airbnb-style interface for selecting date ranges with full support for both Arabic and English languages, including RTL layout support.

## Features

- **Airbnb-style Design**: Modern, clean interface similar to Airbnb's date picker
- **Bilingual Support**: Full Arabic and English language support with RTL layout
- **Two Variants**: Default and Hero variants for different use cases
- **Responsive Design**: Works seamlessly across all device sizes
- **Accessibility**: Built with accessibility best practices
- **Custom Styling**: Flexible styling options for different contexts

## Usage

### Basic Implementation

```tsx
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

const [dateRange, setDateRange] = useState<DateRange>();

<DateRangePicker
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  language={language}
  placeholder="Select check-in and check-out dates"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dateRange` | `DateRange \| undefined` | - | The selected date range |
| `onDateRangeChange` | `(range: DateRange \| undefined) => void` | - | Callback when date range changes |
| `language` | `'ar' \| 'en'` | - | Language for localization |
| `disabled` | `boolean` | `false` | Whether the picker is disabled |
| `className` | `string` | - | Additional CSS classes |
| `placeholder` | `string` | - | Placeholder text when no dates selected |
| `variant` | `'default' \| 'hero'` | `'default'` | Visual variant of the picker |

### Variants

#### Default Variant
Used in property detail pages and forms. Features:
- Larger height (64px)
- Rounded corners (xl)
- Standard border styling
- Shadow effects

#### Hero Variant
Used in hero sections and search bars. Features:
- Compact height (48px)
- Rounded corners (lg)
- Glass morphism styling
- White text and borders for dark backgrounds

## Implementation Examples

### Property Details Page

```tsx
// Before: Separate check-in and check-out pickers
<div>
  <Label>Check-in Date</Label>
  <Popover>
    <PopoverTrigger>
      <Button>Select Date</Button>
    </PopoverTrigger>
    <PopoverContent>
      <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} />
    </PopoverContent>
  </Popover>
</div>

<div>
  <Label>Check-out Date</Label>
  <Popover>
    <PopoverTrigger>
      <Button>Select Date</Button>
    </PopoverTrigger>
    <PopoverContent>
      <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} />
    </PopoverContent>
  </Popover>
</div>

// After: Single date range picker
<div>
  <Label>Stay Dates</Label>
  <DateRangePicker
    dateRange={dateRange}
    onDateRangeChange={setDateRange}
    language={language}
    placeholder="Select check-in and check-out dates"
  />
</div>
```

### Hero Section

```tsx
// Before: Basic date inputs
<div>
  <label>Check In</label>
  <Input type="date" value={checkIn} onChange={...} />
</div>
<div>
  <label>Check Out</label>
  <Input type="date" value={checkOut} onChange={...} />
</div>

// After: Hero variant date range picker
<div>
  <label>Stay Dates</label>
  <DateRangePicker
    dateRange={dateRange}
    onDateRangeChange={setDateRange}
    language={language}
    variant="hero"
    placeholder="Select dates"
  />
</div>
```

## State Management

### Converting from Old Implementation

If you're migrating from the old separate date pickers:

```tsx
// Old state
const [checkInDate, setCheckInDate] = useState<Date>();
const [checkOutDate, setCheckOutDate] = useState<Date>();

// New state
const [dateRange, setDateRange] = useState<DateRange>();

// Helper functions
const calculateTotalNights = () => {
  if (!dateRange?.from || !dateRange?.to) return 0;
  return differenceInDays(dateRange.to, dateRange.from);
};

const calculateTotalAmount = () => {
  const nights = calculateTotalNights();
  if (!listing || nights <= 0) return 0;
  return nights * listing.price_per_night_usd;
};
```

### Database Operations

```tsx
// Database insert
const { data, error } = await supabase
  .from('bookings')
  .insert({
    check_in_date: format(dateRange.from, 'yyyy-MM-dd'),
    check_out_date: format(dateRange.to, 'yyyy-MM-dd'),
    total_nights: calculateTotalNights(),
    // ... other fields
  });
```

## Styling

The component uses Tailwind CSS classes and can be customized through the `className` prop. The component automatically handles:

- RTL layout for Arabic
- Responsive design
- Hover and focus states
- Disabled states
- Variant-specific styling

## Accessibility

- Full keyboard navigation support
- Screen reader compatibility
- ARIA labels and descriptions
- Focus management
- High contrast support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- RTL language support
- Touch device support

## Dependencies

- `react-day-picker` - Core date picker functionality
- `date-fns` - Date manipulation utilities
- `lucide-react` - Icons
- `@radix-ui/react-popover` - Popover component

## Migration Guide

1. **Update Imports**: Replace old calendar imports with the new DateRangePicker
2. **Update State**: Convert separate date states to a single DateRange
3. **Update UI**: Replace separate date picker components with the new component
4. **Update Functions**: Modify helper functions to work with the new date range
5. **Test**: Verify functionality across different languages and devices

## Future Enhancements

- [ ] Custom date range presets (e.g., "Next weekend", "This month")
- [ ] Minimum/maximum stay requirements
- [ ] Blocked dates support
- [ ] Custom date formatting options
- [ ] Animation and transition effects
- [ ] Mobile-optimized touch interactions
