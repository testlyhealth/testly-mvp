import { supabase } from './js/api/supabase.js';

export async function checkTestId3() {
  console.log('=== CHECKING TEST ID 3 ===');
  
  try {
    // 1. Check what test ID 3 is
    console.log('1. Checking what test ID 3 is...');
    const { data: test3, error: test3Error } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .eq('id', 3);
    
    if (test3Error) {
      console.error('Error fetching test 3:', test3Error);
      return;
    }
    
    console.log('Test ID 3:', test3);
    
    // 2. Check how many biomarker links point to test ID 3
    console.log('\n2. Checking biomarker links for test ID 3...');
    const { data: linksFor3, error: links3Error } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .eq('provider_blood_test_id', 3);
    
    if (links3Error) {
      console.error('Error fetching links for test 3:', links3Error);
      return;
    }
    
    console.log('Number of biomarker links for test ID 3:', linksFor3.length);
    console.log('Sample links for test 3:', linksFor3.slice(0, 5));
    
    // 3. Check if there are any links for the problematic test IDs
    console.log('\n3. Checking for links for problematic test IDs...');
    const problematicTestIds = [432, 433, 434, 435];
    
    for (const testId of problematicTestIds) {
      const { data: linksForTest, error: linksError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .eq('provider_blood_test_id', testId);
      
      if (linksError) {
        console.error(`Error fetching links for test ${testId}:`, linksError);
        continue;
      }
      
      console.log(`Test ID ${testId}: ${linksForTest.length} links found`);
      if (linksForTest.length > 0) {
        console.log(`Sample links for test ${testId}:`, linksForTest.slice(0, 3));
      }
    }
    
    // 4. Check if there are any links with provider_blood_test_id = 432, 433, 434, 435
    console.log('\n4. Checking for any links with the problematic test IDs...');
    const { data: allLinks, error: allLinksError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', problematicTestIds);
    
    if (allLinksError) {
      console.error('Error fetching all links:', allLinksError);
      return;
    }
    
    console.log('Total links for problematic test IDs:', allLinks.length);
    if (allLinks.length > 0) {
      console.log('Sample links:', allLinks.slice(0, 5));
    }
    
    // 5. Check what the problematic tests should be
    console.log('\n5. Checking what the problematic tests are...');
    const { data: problematicTests, error: testsError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .in('id', problematicTestIds);
    
    if (testsError) {
      console.error('Error fetching problematic tests:', testsError);
      return;
    }
    
    console.log('Problematic tests:', problematicTests);
    
  } catch (error) {
    console.error('Error in checkTestId3:', error);
  }
} 