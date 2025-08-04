# Safe Blood Test Upload System

## Overview

The new upload system provides robust validation and error handling to ensure database integrity. It prevents the creation of new reference data (providers, biomarkers, categories, etc.) and only allows uploads when all references exist.

## Key Features

### 1. **Two-Phase Validation**
- **Client-side validation**: Checks CSV data before upload
- **Server-side validation**: Double-checks all references exist in database
- **Transaction safety**: All-or-nothing uploads with automatic rollback

### 2. **Reference Data Protection**
- **No automatic creation**: The system will never create new providers, biomarkers, categories, etc.
- **Explicit errors**: Clear error messages when references don't exist
- **Manual control**: You maintain full control over reference data

### 3. **Comprehensive Error Reporting**
- **Detailed validation**: Checks all required fields and data types
- **Row-specific errors**: Shows exactly which rows have problems
- **Clear messaging**: User-friendly error descriptions

## Database Schema

### Main Tables
- `provider_blood_tests` - Main test data
- `providers` - Test providers (Thriva, Medichecks, etc.)
- `biomarkers` - Individual biomarkers (Vitamin D, Testosterone, etc.)
- `product_categories` - Test categories (General Health, Hormones, etc.)
- `lab_accreditations` - Lab accreditations (UKAS, etc.)
- `blood_taking_methods` - Blood collection methods (Finger prick, Venous, etc.)

### Link Tables
- `biomarker_link_table` - Links tests to biomarkers
- `product_category_link_table` - Links tests to categories
- `lab_accreditation_link_table` - Links tests to accreditations
- `blood_taking_method_link_table` - Links tests to collection methods

## CSV Format Requirements

### Required Fields
- `name` - Name of the blood test
- `provider_name` - Must exist in providers table

### Optional Fields
- `price` - Numeric value (positive number)
- `url` - Valid URL format
- `description` - Text description
- `pricing_information` - Additional pricing details
- `biomarker_number` - Integer count of biomarkers
- `doctors_report` - Boolean (true/false)
- `trustpilot_score` - Numeric (0-5)

### Time Fields (One system required)
- `results_returned_time_days` - Integer days
- OR `results_returned_time_min` + `results_returned_time_max` - Integer days

### Reference Fields (Comma-separated)
- `biomarkers` - Must exist in biomarkers table
- `product_categories` - Must exist in product_categories table
- `blood_test_categories` - Must exist in blood_test_categories table
- `lab_accreditations` - Must exist in lab_accreditations table
- `blood_taking_methods` - Must exist in blood_taking_methods table

## Installation

### 1. Update the RPC Function
Run the SQL in `safe_upload_function.sql` in your Supabase SQL editor:

```sql
-- Copy and paste the entire function from safe_upload_function.sql
```

### 2. Update Admin Page
The admin page has been updated to use the new function:
- Enhanced client-side validation
- Better error reporting
- Uses `bulk_insert_blood_tests_safe` instead of the old function

## How It Works

### 1. CSV Upload & Preview
- User uploads CSV file
- System shows preview of first 5 rows
- Validates CSV format and structure

### 2. Client-Side Validation
- Checks all required fields
- Validates data types (numbers, URLs, etc.)
- Verifies references exist in database
- Shows detailed error report

### 3. Server-Side Validation
- Double-checks all references exist
- Validates data integrity
- Prevents any database modifications to reference tables

### 4. Database Upload
- Uses database transaction for safety
- Inserts only into `provider_blood_tests` and link tables
- Rolls back on any error
- Returns detailed success/error report

## Error Handling

### Client-Side Errors (Upload Blocked)
- Missing required fields
- Invalid data types
- Non-existent references
- Invalid URL formats
- Invalid numeric values

### Server-Side Errors (Upload Blocked)
- Database constraint violations
- Reference data not found
- Transaction failures

### Warnings (Upload Allowed)
- Both time systems filled (days + min/max)
- Non-critical data issues

## Example Error Messages

```
Test "Vitamin D Test" (Provider: NewProvider): Provider "NewProvider" does not exist
Test "Hormone Panel" (Provider: Thriva): Biomarker "NewBiomarker" does not exist
Row 5 (Test Name): Invalid URL format
Row 7 (Test Name): Price must be a valid positive number
```

## Troubleshooting

### Common Issues

1. **"Provider does not exist"**
   - Add the provider to the `providers` table manually
   - Check spelling and case sensitivity

2. **"Biomarker does not exist"**
   - Add the biomarker to the `biomarkers` table manually
   - Ensure exact name match

3. **"Product category does not exist"**
   - Add the category to the `product_categories` table manually

4. **Upload fails with database error**
   - Check database logs in Supabase dashboard
   - Verify all foreign key constraints are satisfied

### Database Maintenance

To add new reference data:

```sql
-- Add new provider
INSERT INTO providers (name) VALUES ('New Provider Name');

-- Add new biomarker
INSERT INTO biomarkers (name) VALUES ('New Biomarker Name');

-- Add new category
INSERT INTO product_categories (name) VALUES ('New Category Name');

-- Add new accreditation
INSERT INTO lab_accreditations (name) VALUES ('New Accreditation Name');

-- Add new blood taking method
INSERT INTO blood_taking_methods (name) VALUES ('New Method Name');
```

## Security Features

- **Authentication required**: Only authorized users can access admin page
- **Email validation**: Only specific emails can upload
- **Transaction safety**: No partial uploads
- **Reference protection**: Cannot modify core reference data
- **Error isolation**: Failed uploads don't affect existing data

## Performance

- **Efficient validation**: Single database query for all references
- **Batch processing**: Handles multiple tests in one transaction
- **Minimal database calls**: Optimized for speed
- **Memory efficient**: Processes data in chunks

## Future Enhancements

Potential improvements:
- Bulk reference data import
- CSV template generation
- Upload history tracking
- Advanced validation rules
- Automated testing 