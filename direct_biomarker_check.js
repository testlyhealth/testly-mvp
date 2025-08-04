import { supabase } from './js/api/supabase.js';

export async function directBiomarkerCheck() {
  console.log('=== DIRECT BIOMARKER LINK CHECK ===');
  
  const problematicTestIds = [432, 433, 434, 435];
  
  try {
    // 1. Direct query for biomarker links for problematic test IDs
    console.log('1. Directly querying biomarker links for problematic test IDs...');
    const { data: directLinks, error: directError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', problematicTestIds);
    
    if (directError) {
      console.error('Error in direct query:', directError);
      return;
    }
    
    console.log('Direct query results:', directLinks);
    console.log('Number of direct links found:', directLinks.length);
    
    // 2. Check what test IDs are actually in the biomarker_link_table
    console.log('\n2. Checking what test IDs exist in biomarker_link_table...');
    const { data: allTestIds, error: allTestIdsError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id')
      .limit(20);
    
    if (allTestIdsError) {
      console.error('Error fetching all test IDs:', allTestIdsError);
      return;
    }
    
    const uniqueTestIds = [...new Set(allTestIds.map(l => l.provider_blood_test_id))];
    console.log('Sample test IDs in biomarker_link_table:', uniqueTestIds);
    
    // 3. Check if the problematic test IDs exist at all
    console.log('\n3. Checking if problematic test IDs exist in biomarker_link_table...');
    for (const testId of problematicTestIds) {
      const { data: linksForTest, error: linksError } = await supabase
        .from('biomarker_link_table')
        .select('provider_blood_test_id, biomarker_id')
        .eq('provider_blood_test_id', testId);
      
      if (linksError) {
        console.error(`Error checking test ${testId}:`, linksError);
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
    
    // 5. Check what the problematic tests are
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
    console.error('Error in directBiomarkerCheck:', error);
  }
} 