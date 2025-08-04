// Direct Database Check Script
// This script will directly query the database to see what's happening with biomarker links

import { supabase } from './js/api/supabase.js';

export async function directDbCheck() {
  console.log('=== DIRECT DATABASE CHECK ===');
  
  // These are the problematic test IDs
  const problematicTestIds = [432, 433, 434, 435];
  
  try {
    // 1. Check what's actually in the biomarker_link_table for these tests
    console.log('\n1. Direct query of biomarker_link_table for problematic tests...');
    const { data: directLinks, error: directError } = await supabase
      .from('biomarker_link_table')
      .select('*')
      .in('provider_blood_test_id', problematicTestIds);
    
    if (directError) {
      console.error('Error in direct query:', directError);
      return;
    }
    
    console.log('Direct query results:', directLinks);
    console.log('Number of links found:', directLinks.length);
    
    // 2. Check if there are ANY biomarker links for these test IDs
    console.log('\n2. Checking ALL biomarker links in the table...');
    const { data: allLinks, error: allError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .limit(100);
    
    if (allError) {
      console.error('Error fetching all links:', allError);
      return;
    }
    
    console.log('Sample of all biomarker links:', allLinks.slice(0, 10));
    console.log('Total links in sample:', allLinks.length);
    
    // Check if our problematic test IDs appear anywhere
    const problematicTestIdsInLinks = allLinks.filter(link => 
      problematicTestIds.includes(link.provider_blood_test_id)
    );
    
    console.log('Problematic test IDs found in sample:', problematicTestIdsInLinks);
    
    // 3. Check the actual test records
    console.log('\n3. Checking the actual test records...');
    const { data: testRecords, error: testError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id, price')
      .in('id', problematicTestIds);
    
    if (testError) {
      console.error('Error fetching test records:', testError);
      return;
    }
    
    console.log('Test records:', testRecords);
    
    // 4. Check if there are any biomarker links for ANY tests with similar names
    console.log('\n4. Checking for similar tests with biomarker links...');
    const { data: similarTests, error: similarError } = await supabase
      .from('provider_blood_tests')
      .select('id, name')
      .or('name.ilike.%testosterone%,name.ilike.%hormone%,name.ilike.%sports%')
      .limit(20);
    
    if (!similarError && similarTests.length > 0) {
      console.log('Similar tests found:', similarTests);
      
      const similarTestIds = similarTests.map(t => t.id);
      const { data: similarLinks, error: similarLinkError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .in('provider_blood_test_id', similarTestIds);
      
      if (!similarLinkError) {
        console.log('Biomarker links for similar tests:', similarLinks);
        
        // Group by test ID
        const linksByTest = {};
        similarLinks.forEach(link => {
          if (!linksByTest[link.provider_blood_test_id]) {
            linksByTest[link.provider_blood_test_id] = [];
          }
          linksByTest[link.provider_blood_test_id].push(link.biomarker_id);
        });
        
        console.log('Links grouped by test ID:', linksByTest);
        
        // Check which of our problematic tests have links
        for (const testId of problematicTestIds) {
          const hasLinks = linksByTest[testId] && linksByTest[testId].length > 0;
          console.log(`Test ID ${testId}: ${hasLinks ? '✅ Has links' : '❌ No links'}`);
        }
      }
    }
    
    // 5. Check if there's a pattern in the test IDs
    console.log('\n5. Checking for patterns in test IDs...');
    const { data: allTestIds, error: idError } = await supabase
      .from('provider_blood_tests')
      .select('id, name')
      .order('id', { ascending: true })
      .limit(50);
    
    if (!idError) {
      console.log('Test ID ranges:', allTestIds.map(t => ({ id: t.id, name: t.name })));
      
      // Check if our problematic IDs are in a different range
      const problematicRange = problematicTestIds.map(id => Math.floor(id / 100) * 100);
      console.log('Problematic test ID ranges:', problematicRange);
    }
    
    console.log('\n=== DIRECT CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error in direct check:', error);
  }
} 