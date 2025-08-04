// Debug Specific Tests Script
// This script will check the specific tests that are known to have biomarker issues

import { supabase } from './js/api/supabase.js';

async function debugSpecificTests() {
  console.log('=== DEBUGGING SPECIFIC TESTS ===');
  
  // These are the tests that are known to have issues
  const problematicTestNames = [
    'Testosterone Check',
    'Testosterone Plus Profile', 
    'Well Man Premier Plus Profile',
    'Sports Hormone Profile'
  ];
  
  try {
    // 1. Check if these tests exist in the database
    console.log('\n1. Checking if problematic tests exist in database...');
    const { data: tests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id, providers(name)')
      .in('name', problematicTestNames);
    
    if (testError) {
      console.error('Error fetching tests:', testError);
      return;
    }
    
    console.log('Problematic tests found:', tests);
    
    if (tests.length === 0) {
      console.error('❌ No problematic tests found in database!');
      return;
    }
    
    // 2. Check if these tests are in the men's health category
    console.log('\n2. Checking if tests are in men\'s health category...');
    const testIds = tests.map(t => t.id);
    
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3)
      .in('provider_blood_test_id', testIds);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return;
    }
    
    const testIdsInCategory = categoryLinks.map(l => l.provider_blood_test_id);
    const testsInCategory = tests.filter(t => testIdsInCategory.includes(t.id));
    
    console.log('Tests in men\'s health category:', testsInCategory.length);
    console.log('Tests in category:', testsInCategory.map(t => ({
      id: t.id,
      name: t.name,
      provider: t.providers?.name
    })));
    
    // 3. Check biomarker links for these specific tests
    console.log('\n3. Checking biomarker links for problematic tests...');
    const { data: biomarkerLinks, error: linkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', testIds);
    
    if (linkError) {
      console.error('Error fetching biomarker links:', linkError);
      return;
    }
    
    console.log('Biomarker links found for problematic tests:', biomarkerLinks.length);
    console.log('Sample links:', biomarkerLinks.slice(0, 5));
    
    // 4. Check each test individually
    console.log('\n4. Checking each problematic test individually...');
    
    for (const test of tests) {
      console.log(`\n--- Checking test: ${test.name} (ID: ${test.id}) ---`);
      
      // Check if test is in category
      const inCategory = testIdsInCategory.includes(test.id);
      console.log(`In men's health category: ${inCategory}`);
      
      // Check biomarker links for this specific test
      const testLinks = biomarkerLinks.filter(l => l.provider_blood_test_id === test.id);
      console.log(`Biomarker links for this test: ${testLinks.length}`);
      
      if (testLinks.length > 0) {
        console.log('Sample links for this test:', testLinks.slice(0, 3));
        
        // Get biomarker details
        const biomarkerIds = testLinks.map(l => l.biomarker_id);
        const { data: biomarkers, error: bioError } = await supabase
          .from('biomarkers')
          .select('id, name')
          .in('id', biomarkerIds);
        
        if (bioError) {
          console.error('Error fetching biomarkers:', bioError);
        } else {
          console.log('Biomarkers for this test:', biomarkers.map(b => b.name));
        }
      } else {
        console.log('❌ NO BIOMARKER LINKS FOUND FOR THIS TEST!');
        
        // Check if there are any links with different ID types
        const allLinks = await supabase
          .from('biomarker_link_table')
          .select('provider_blood_test_id, biomarker_id')
          .eq('provider_blood_test_id', test.id);
        
        console.log('Direct query for test ID:', allLinks);
      }
    }
    
    // 5. Check if there's a pattern in test IDs
    console.log('\n5. Checking for patterns in test IDs...');
    const testIdRanges = tests.map(t => ({
      id: t.id,
      name: t.name,
      idType: typeof t.id,
      idRange: Math.floor(t.id / 100) * 100 // Group by hundreds
    }));
    
    console.log('Test ID analysis:', testIdRanges);
    
    // 6. Check if these tests have any special properties
    console.log('\n6. Checking for special properties...');
    const { data: allTests, error: allTestError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id, price, description')
      .limit(100);
    
    if (!allTestError) {
      const problematicIds = tests.map(t => t.id);
      const otherTests = allTests.filter(t => !problematicIds.includes(t.id));
      
      console.log('Average price of problematic tests:', 
        tests.reduce((sum, t) => sum + (t.price || 0), 0) / tests.length);
      console.log('Average price of other tests:', 
        otherTests.reduce((sum, t) => sum + (t.price || 0), 0) / otherTests.length);
      
      console.log('Provider distribution of problematic tests:', 
        tests.map(t => t.providers?.name).filter(Boolean));
    }
    
    console.log('\n=== DEBUGGING COMPLETE ===');
    
  } catch (error) {
    console.error('Error in debugging script:', error);
  }
}

// Run the debugging script
debugSpecificTests(); 