import { supabase } from './js/api/supabase.js';

export async function checkMissingLinks() {
  console.log('=== CHECKING MISSING BIOMARKER LINKS ===');
  
  const problematicTestIds = [432, 433, 434, 435];
  
  try {
    // 1. Check if these tests exist in the provider_blood_tests table
    console.log('1. Checking if problematic tests exist in provider_blood_tests table...');
    const { data: tests, error: testsError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .in('id', problematicTestIds);
    
    if (testsError) {
      console.error('Error fetching tests:', testsError);
      console.error('Error details:', JSON.stringify(testsError, null, 2));
      return;
    }
    
    console.log('Tests found in database:', tests);
    
    // 2. Check for biomarker links for these specific tests
    console.log('\n2. Checking for biomarker links for these tests...');
    const { data: links, error: linksError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', problematicTestIds);
    
    if (linksError) {
      console.error('Error fetching links:', linksError);
      console.error('Error details:', JSON.stringify(linksError, null, 2));
      return;
    }
    
    console.log('Biomarker links found:', links);
    console.log('Number of links found:', links.length);
    
    // 3. Check what biomarkers these tests should have based on their names
    console.log('\n3. Checking what biomarkers these tests should have...');
    for (const test of tests) {
      console.log(`\nTest: ${test.name} (ID: ${test.id})`);
      
      // Check if test name contains keywords that suggest specific biomarkers
      const testName = test.name.toLowerCase();
      if (testName.includes('testosterone')) {
        console.log('  - Should have: Testosterone biomarker');
      }
      if (testName.includes('hormone') || testName.includes('hormones')) {
        console.log('  - Should have: Hormone-related biomarkers');
      }
      if (testName.includes('sports')) {
        console.log('  - Should have: Sports-related biomarkers');
      }
      if (testName.includes('well man')) {
        console.log('  - Should have: Comprehensive male health biomarkers');
      }
    }
    
    // 4. Check if there are any biomarker links for similar tests
    console.log('\n4. Checking for similar tests with biomarker links...');
    const { data: similarTests, error: similarError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .gte('provider_blood_test_id', 430)
      .lte('provider_blood_test_id', 440);
    
    if (similarError) {
      console.error('Error fetching similar tests:', similarError);
      console.error('Error details:', JSON.stringify(similarError, null, 2));
      return;
    }
    
    console.log('Similar test links (IDs 430-440):', similarTests);
    console.log('Number of similar test links:', similarTests.length);
    
    // 5. Check if the issue is with the test IDs or the link table
    console.log('\n5. Checking if these test IDs exist in the link table at all...');
    const { data: allLinks, error: allLinksError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .limit(10);
    
    if (allLinksError) {
      console.error('Error fetching all links:', allLinksError);
      console.error('Error details:', JSON.stringify(allLinksError, null, 2));
      return;
    }
    
    console.log('Sample of all biomarker links:', allLinks);
    console.log('Sample link test IDs:', allLinks.map(l => l.provider_blood_test_id));
    
  } catch (error) {
    console.error('Error in checkMissingLinks:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
} 