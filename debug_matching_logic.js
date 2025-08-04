import { supabase } from './js/api/supabase.js';

export async function debugMatchingLogic() {
  console.log('=== DEBUGGING MATCHING LOGIC ===');
  
  const problematicTestIds = [432, 433, 434, 435];
  
  try {
    // 1. Get the tests
    const { data: tests, error: testsError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .in('id', problematicTestIds);
    
    if (testsError) {
      console.error('Error fetching tests:', testsError);
      return;
    }
    
    // 2. Get ALL biomarker links
    const { data: allLinks, error: linksError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id');
    
    if (linksError) {
      console.error('Error fetching links:', linksError);
      return;
    }
    
    console.log('Total biomarker links in database:', allLinks.length);
    
    // 3. Test the exact matching logic from general-health.js
    for (const test of tests) {
      console.log(`\n=== TESTING MATCHING FOR: ${test.name} (ID: ${test.id}) ===`);
      
      // Get links for this specific test
      const testLinks = allLinks.filter(link => {
        const linkTestId = link.provider_blood_test_id;
        const testId = test.id;
        
        console.log(`Comparing: link ID ${linkTestId} (type: ${typeof linkTestId}) vs test ID ${testId} (type: ${typeof testId})`);
        
        // Try exact match
        if (linkTestId === testId) {
          console.log(`  ✅ EXACT MATCH: ${linkTestId} === ${testId}`);
          return true;
        }
        
        // Try parsed comparison
        if (parseInt(linkTestId) === parseInt(testId)) {
          console.log(`  ✅ PARSED MATCH: ${parseInt(linkTestId)} === ${parseInt(testId)}`);
          return true;
        }
        
        // Try loose comparison
        if (linkTestId == testId) {
          console.log(`  ✅ LOOSE MATCH: ${linkTestId} == ${testId}`);
          return true;
        }
        
        console.log(`  ❌ NO MATCH: ${linkTestId} != ${testId}`);
        return false;
      });
      
      console.log(`\nFound ${testLinks.length} links for test "${test.name}"`);
      
      if (testLinks.length > 0) {
        console.log('Sample links:', testLinks.slice(0, 3));
      }
    }
    
    // 4. Check if there's a data type issue
    console.log('\n=== DATA TYPE ANALYSIS ===');
    const sampleLink = allLinks[0];
    const sampleTest = tests[0];
    
    console.log('Sample link ID:', sampleLink?.provider_blood_test_id, 'Type:', typeof sampleLink?.provider_blood_test_id);
    console.log('Sample test ID:', sampleTest?.id, 'Type:', typeof sampleTest?.id);
    
    // 5. Check if the issue is with the specific test IDs
    console.log('\n=== CHECKING SPECIFIC TEST IDS ===');
    for (const testId of problematicTestIds) {
      const linksForThisId = allLinks.filter(link => link.provider_blood_test_id === testId);
      console.log(`Test ID ${testId}: ${linksForThisId.length} links found`);
    }
    
  } catch (error) {
    console.error('Error in debugMatchingLogic:', error);
  }
} 