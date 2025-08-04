// Targeted Debug Script
// Compare problematic tests with working tests to find the difference

import { supabase } from './js/api/supabase.js';

export async function targetedDebug() {
  console.log('=== TARGETED DEBUG ===');
  
  // Problematic tests (no biomarkers showing)
  const problematicTestIds = [432, 433, 434, 435];
  
  // Working tests (biomarkers showing)
  const workingTestIds = [423, 424, 425]; // These are the ones that show biomarkers
  
  try {
    // 1. Compare the actual test records
    console.log('\n1. Comparing test records...');
    
    const { data: problematicTests, error: probError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id, price, description')
      .in('id', problematicTestIds);
    
    const { data: workingTests, error: workError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id, price, description')
      .in('id', workingTestIds);
    
    if (probError || workError) {
      console.error('Error fetching tests:', probError || workError);
      return;
    }
    
    console.log('Problematic tests:', problematicTests);
    console.log('Working tests:', workingTests);
    
    // 2. Compare biomarker links directly
    console.log('\n2. Comparing biomarker links...');
    
    const { data: problematicLinks, error: probLinkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', problematicTestIds);
    
    const { data: workingLinks, error: workLinkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', workingTestIds);
    
    if (probLinkError || workLinkError) {
      console.error('Error fetching links:', probLinkError || workLinkError);
      return;
    }
    
    console.log('Problematic test links:', problematicLinks);
    console.log('Working test links:', workingLinks);
    
    // 3. Check data types
    console.log('\n3. Checking data types...');
    
    if (problematicLinks.length > 0 && workingLinks.length > 0) {
      console.log('Problematic link test ID type:', typeof problematicLinks[0].provider_blood_test_id);
      console.log('Problematic link test ID value:', problematicLinks[0].provider_blood_test_id);
      console.log('Working link test ID type:', typeof workingLinks[0].provider_blood_test_id);
      console.log('Working link test ID value:', workingLinks[0].provider_blood_test_id);
    }
    
    // 4. Test the exact query that's failing
    console.log('\n4. Testing the exact query that fails...');
    
    // Simulate the exact query from general-health.js
    const testIds = problematicTestIds;
    console.log('Querying for test IDs:', testIds);
    
    const { data: queryResult, error: queryError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', testIds);
    
    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log('Query result:', queryResult);
      console.log('Query returned:', queryResult.length, 'links');
    }
    
    // 5. Test individual queries
    console.log('\n5. Testing individual queries...');
    
    for (const testId of problematicTestIds) {
      const { data: individualResult, error: individualError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .eq('provider_blood_test_id', testId);
      
      console.log(`Test ID ${testId}: ${individualResult?.length || 0} links, error: ${individualError?.message || 'none'}`);
    }
    
    // 6. Check if there's a pattern in the test IDs
    console.log('\n6. Checking for patterns...');
    
    const allTestIds = [...problematicTestIds, ...workingTestIds];
    console.log('All test IDs:', allTestIds);
    console.log('ID ranges:', allTestIds.map(id => Math.floor(id / 100) * 100));
    
    // 7. Check if the issue is with the .in() query specifically
    console.log('\n7. Testing .in() vs .eq() queries...');
    
    // Test with .in() (the failing method)
    const { data: inResult, error: inError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', problematicTestIds);
    
    console.log('.in() query result:', inResult?.length || 0, 'links');
    
    // Test with individual .eq() queries
    let eqResults = [];
    for (const testId of problematicTestIds) {
      const { data: eqResult, error: eqError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .eq('provider_blood_test_id', testId);
      
      if (!eqError && eqResult) {
        eqResults = eqResults.concat(eqResult);
      }
    }
    
    console.log('.eq() queries result:', eqResults.length, 'links');
    console.log('Difference:', (inResult?.length || 0) - eqResults.length);
    
    console.log('\n=== TARGETED DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Error in targeted debug:', error);
  }
} 