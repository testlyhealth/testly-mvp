-- Safe Blood Test Upload Function
-- This function validates all references before inserting and uses transactions for rollback
-- Run this in your Supabase SQL editor

create or replace function bulk_insert_blood_tests_safe(tests jsonb)
returns jsonb
language plpgsql
as $$
declare
  test jsonb;
  inserted_count int := 0;
  result jsonb := '[]'::jsonb;
  errors text[] := '{}';
  provider_id int;
  test_id int;
  biomarker_id int;
  category_id int;
  blood_test_category_id int;
  acc_id int;
  method_id int;
  acc text;
  acc_array text[];
  cat text;
  cat_array text[];
  bio text;
  bio_array text[];
  method text;
  method_array text[];
  test_name text;
  provider_name text;
  validation_errors text[];
  i int;
begin
  -- Start transaction
  begin
    -- First pass: validate all references exist
    for i in 0..jsonb_array_length(tests)-1 loop
      test := tests->i;
      test_name := test->>'name';
      provider_name := test->>'provider_name';
      validation_errors := '{}';
      
      -- Validate provider exists
      select id into provider_id from providers where name = provider_name;
      if provider_id is null then
        validation_errors := validation_errors || format('Provider "%s" does not exist', provider_name);
      end if;
      
      -- Validate lab accreditations exist
      if test ? 'lab_accreditations' and test->>'lab_accreditations' != '' then
        acc_array := string_to_array(test->>'lab_accreditations', ',');
        foreach acc in array acc_array loop
          select id into acc_id from lab_accreditations where name = trim(acc);
          if acc_id is null then
            validation_errors := validation_errors || format('Lab accreditation "%s" does not exist', trim(acc));
          end if;
        end loop;
      end if;
      
      -- Validate product categories exist
      if test ? 'product_categories' and test->>'product_categories' != '' then
        cat_array := string_to_array(test->>'product_categories', ',');
        foreach cat in array cat_array loop
          select id into category_id from product_categories where name = trim(cat);
          if category_id is null then
            validation_errors := validation_errors || format('Product category "%s" does not exist', trim(cat));
          end if;
        end loop;
      end if;
      
      -- Validate blood test categories exist
      if test ? 'blood_test_categories' and test->>'blood_test_categories' != '' then
        cat_array := string_to_array(test->>'blood_test_categories', ',');
        foreach cat in array cat_array loop
          select id into blood_test_category_id from blood_test_categories where name = trim(cat);
          if blood_test_category_id is null then
            validation_errors := validation_errors || format('Blood test category "%s" does not exist', trim(cat));
          end if;
        end loop;
      end if;
      
      -- Validate biomarkers exist
      if test ? 'biomarkers' and test->>'biomarkers' != '' then
        bio_array := string_to_array(test->>'biomarkers', ',');
        foreach bio in array bio_array loop
          select id into biomarker_id from biomarkers where name = trim(bio);
          if biomarker_id is null then
            validation_errors := validation_errors || format('Biomarker "%s" does not exist', trim(bio));
          end if;
        end loop;
      end if;
      
      -- Validate blood taking methods exist
      if test ? 'blood_taking_methods' and test->>'blood_taking_methods' != '' then
        method_array := string_to_array(test->>'blood_taking_methods', ',');
        foreach method in array method_array loop
          select id into method_id from blood_taking_methods where name = trim(method);
          if method_id is null then
            validation_errors := validation_errors || format('Blood taking method "%s" does not exist', trim(method));
          end if;
        end loop;
      end if;
      
      -- If validation errors, add to errors array
      if array_length(validation_errors, 1) > 0 then
        errors := errors || format('Test "%s" (Provider: %s): %s', 
                                 coalesce(test_name, 'UNNAMED'), 
                                 coalesce(provider_name, 'UNKNOWN'), 
                                 array_to_string(validation_errors, '; '));
      end if;
    end loop;
    
    -- If validation errors exist, rollback and return errors
    if array_length(errors, 1) > 0 then
      return jsonb_build_object(
        'inserted', 0,
        'errors', errors,
        'details', '[]'::jsonb
      );
    end if;
    
    -- Second pass: insert all data (all references are now validated)
    for test in select * from jsonb_array_elements(tests) loop
      test_name := test->>'name';
      provider_name := test->>'provider_name';
      
      -- Get provider ID (already validated)
      select id into provider_id from providers where name = provider_name;
      
      -- Insert blood test
      insert into provider_blood_tests (
        provider_id, name, price, url, doctors_report, description, pricing_information,
        biomarker_number, results_returned_time_days, results_returned_time_min, results_returned_time_max, trustpilot_score
      ) values (
        provider_id,
        test->>'name',
        NULLIF(test->>'price', '')::numeric,
        test->>'url',
        (lower(test->>'doctors_report') = 'true'),
        test->>'description',
        test->>'pricing_information',
        NULLIF(test->>'biomarker_number', '')::int,
        NULLIF(test->>'results_returned_time_days', '')::int,
        NULLIF(test->>'results_returned_time_min', '')::int,
        NULLIF(test->>'results_returned_time_max', '')::int,
        NULLIF(test->>'trustpilot_score', '')::numeric
      ) returning id into test_id;
      
      -- Link lab accreditations (already validated)
      if test ? 'lab_accreditations' and test->>'lab_accreditations' != '' then
        acc_array := string_to_array(test->>'lab_accreditations', ',');
        foreach acc in array acc_array loop
          select id into acc_id from lab_accreditations where name = trim(acc);
          insert into lab_accreditation_link_table (provider_blood_test_id, lab_accreditation_id)
          values (test_id, acc_id) on conflict do nothing;
        end loop;
      end if;
      
      -- Link product categories (already validated)
      if test ? 'product_categories' and test->>'product_categories' != '' then
        cat_array := string_to_array(test->>'product_categories', ',');
        foreach cat in array cat_array loop
          select id into category_id from product_categories where name = trim(cat);
          insert into product_category_link_table (provider_blood_test_id, product_category_id)
          values (test_id, category_id) on conflict do nothing;
        end loop;
      end if;
      
      -- Link blood test categories (already validated)
      if test ? 'blood_test_categories' and test->>'blood_test_categories' != '' then
        cat_array := string_to_array(test->>'blood_test_categories', ',');
        foreach cat in array cat_array loop
          select id into blood_test_category_id from blood_test_categories where name = trim(cat);
          insert into blood_test_category_link_table (provider_blood_test_id, blood_test_category_id)
          values (test_id, blood_test_category_id) on conflict do nothing;
        end loop;
      end if;
      
      -- Link biomarkers (already validated)
      if test ? 'biomarkers' and test->>'biomarkers' != '' then
        bio_array := string_to_array(test->>'biomarkers', ',');
        foreach bio in array bio_array loop
          select id into biomarker_id from biomarkers where name = trim(bio);
          insert into biomarker_link_table (provider_blood_test_id, biomarker_id)
          values (test_id, biomarker_id) on conflict do nothing;
        end loop;
      end if;
      
      -- Link blood taking methods (already validated)
      if test ? 'blood_taking_methods' and test->>'blood_taking_methods' != '' then
        method_array := string_to_array(test->>'blood_taking_methods', ',');
        foreach method in array method_array loop
          select id into method_id from blood_taking_methods where name = trim(method);
          insert into blood_taking_method_link_table (provider_blood_test_id, blood_taking_method_id)
          values (test_id, method_id) on conflict do nothing;
        end loop;
      end if;
      
      inserted_count := inserted_count + 1;
      result := result || jsonb_build_object('test_name', test_name, 'test_id', test_id);
    end loop;
    
    -- Commit transaction
    return jsonb_build_object(
      'inserted', inserted_count,
      'errors', errors,
      'details', result
    );
    
  exception when others then
    -- Rollback transaction on any error
    raise exception 'Upload failed: %', SQLERRM;
  end;
end;
$$; 