// Check Problematic Tests Script
// This script will check what's in the database for the problematic tests

import { supabase } from './js/api/supabase.js';

async function checkProblematicTests() {
  console.log('=== CHECKING PROBLEMATIC TESTS ===');
  
  // These are the tests that have 0 biomarker links
  const problematicTestIds = [432, 433, 434, 435];
  
  try {
    // 1. Check the test details
    console.log('\n1. Checking test details...');
    const { data: tests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id, price, description, biomarker_number')
      .in('id', problematicTestIds);
    
    if (testError) {
      console.error('Error fetching tests:', testError);
      return;
    }
    
    console.log('Problematic tests found:', tests);
    
    // 2. Check if they have any biomarker links at all
    console.log('\n2. Checking biomarker links...');
    const { data: biomarkerLinks, error: linkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', problematicTestIds);
    
    if (linkError) {
      console.error('Error fetching biomarker links:', linkError);
      return;
    }
    
    console.log('Biomarker links found:', biomarkerLinks.length);
    console.log('Links:', biomarkerLinks);
    
    // 3. Check what biomarkers these tests should have based on their names
    console.log('\n3. Checking what biomarkers these tests should have...');
    
    const testNameToExpectedBiomarkers = {
      'Sports Hormone Profile': ['Testosterone', 'Free Testosterone', 'SHBG', 'DHEA', 'Cortisol'],
      'Testosterone Check': ['Testosterone', 'Free Testosterone'],
      'Testosterone Plus Profile': ['Testosterone', 'Free Testosterone', 'SHBG', 'Albumin'],
      'Well Man Premier Plus Profile': ['Testosterone', 'Free Testosterone', 'SHBG', 'DHEA', 'Cortisol', 'PSA', 'LH', 'FSH']
    };
    
    for (const test of tests) {
      console.log(`\n--- Test: ${test.name} (ID: ${test.id}) ---`);
      
      const expectedBiomarkers = testNameToExpectedBiomarkers[test.name] || [];
      console.log('Expected biomarkers:', expectedBiomarkers);
      
      // Check if these biomarkers exist in the database
      if (expectedBiomarkers.length > 0) {
        const { data: existingBiomarkers, error: bioError } = await supabase
          .from('biomarkers')
          .select('id, name')
          .in('name', expectedBiomarkers);
        
        if (bioError) {
          console.error('Error fetching biomarkers:', bioError);
        } else {
          console.log('Existing biomarkers in database:', existingBiomarkers.map(b => b.name));
          
          const missingBiomarkers = expectedBiomarkers.filter(name => 
            !existingBiomarkers.some(b => b.name === name)
          );
          
          if (missingBiomarkers.length > 0) {
            console.log('❌ MISSING BIOMARKERS:', missingBiomarkers);
          } else {
            console.log('✅ All expected biomarkers exist in database');
          }
        }
      }
    }
    
    // 4. Check if there are any tests with similar names that DO have biomarkers
    console.log('\n4. Checking similar tests with biomarkers...');
    const { data: similarTests, error: similarError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .or('name.ilike.%testosterone%,name.ilike.%hormone%,name.ilike.%sports%')
      .limit(10);
    
    if (!similarError && similarTests.length > 0) {
      console.log('Similar tests found:', similarTests.map(t => ({ id: t.id, name: t.name })));
      
      // Check which of these have biomarker links
      const similarTestIds = similarTests.map(t => t.id);
      const { data: similarLinks, error: similarLinkError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .in('provider_blood_test_id', similarTestIds);
      
      if (!similarLinkError) {
        const testsWithLinks = [...new Set(similarLinks.map(l => l.provider_blood_test_id))];
        console.log('Similar tests with biomarker links:', testsWithLinks);
        
        for (const test of similarTests) {
          const hasLinks = testsWithLinks.includes(test.id);
          console.log(`- ${test.name} (ID: ${test.id}): ${hasLinks ? '✅ Has links' : '❌ No links'}`);
        }
      }
    }
    
    console.log('\n=== CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Error in check script:', error);
  }
}

// Run the check script
checkProblematicTests(); 