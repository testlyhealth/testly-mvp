import { supabase } from './js/api/supabase.js';

export async function checkSpecificTests() {
  console.log('=== CHECKING SPECIFIC TESTS 436 & 437 ===');
  
  try {
    // 1. Check what tests 436 and 437 are
    console.log('1. Checking what tests 436 and 437 are...');
    const { data: specificTests, error: testError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .in('id', [436, 437]);
    
    if (testError) {
      console.error('Error fetching specific tests:', JSON.stringify(testError, null, 2));
      return;
    }
    
    console.log('Tests 436 and 437:', specificTests);
    
    // 2. Check if they have biomarker links
    console.log('\n2. Checking biomarker links for tests 436 and 437...');
    const { data: biomarkerLinks, error: linkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', [436, 437]);
    
    if (linkError) {
      console.error('Error fetching biomarker links:', JSON.stringify(linkError, null, 2));
      return;
    }
    
    console.log('Biomarker links for tests 436 and 437:', biomarkerLinks);
    console.log('Number of biomarker links:', biomarkerLinks.length);
    
    // 3. Check what biomarkers these IDs correspond to
    if (biomarkerLinks.length > 0) {
      const biomarkerIds = biomarkerLinks.map(l => l.biomarker_id);
      console.log('\n3. Checking what biomarkers these IDs correspond to...');
      
      const { data: biomarkers, error: bioError } = await supabase
        .from('biomarkers')
        .select('id, name')
        .in('id', biomarkerIds);
      
      if (bioError) {
        console.error('Error fetching biomarkers:', JSON.stringify(bioError, null, 2));
        return;
      }
      
      console.log('Biomarkers for tests 436 and 437:', biomarkers);
    }
    
    // 4. Compare with a working test (like 432)
    console.log('\n4. Comparing with working test 432...');
    const { data: workingTestLinks, error: workingLinkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .eq('provider_blood_test_id', 432);
    
    if (workingLinkError) {
      console.error('Error fetching working test links:', JSON.stringify(workingLinkError, null, 2));
      return;
    }
    
    console.log('Biomarker links for working test 432:', workingTestLinks);
    console.log('Number of biomarker links for test 432:', workingTestLinks.length);
    
    // 5. Check if there's a data type difference
    console.log('\n5. Checking data types...');
    console.log('Test 436 ID type:', typeof specificTests.find(t => t.id === 436)?.id);
    console.log('Test 437 ID type:', typeof specificTests.find(t => t.id === 437)?.id);
    console.log('Test 432 ID type:', typeof 432);
    
    // 6. Check if the issue is in the chunking logic
    console.log('\n6. Checking if tests 436 and 437 are in the same chunk...');
    const allTestIds = [5,8,14,15,19,20,29,40,42,44,45,46,52,60,66,73,97,100,103,110,122,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439];
    const maxIdsPerQuery = 50;
    
    const chunks = [];
    for (let i = 0; i < allTestIds.length; i += maxIdsPerQuery) {
      chunks.push(allTestIds.slice(i, i + maxIdsPerQuery));
    }
    
    console.log('Chunks:', chunks.map((chunk, i) => `Chunk ${i + 1}: ${chunk}`));
    
    const chunk436 = chunks.findIndex(chunk => chunk.includes(436));
    const chunk437 = chunks.findIndex(chunk => chunk.includes(437));
    
    console.log('Test 436 is in chunk:', chunk436 + 1);
    console.log('Test 437 is in chunk:', chunk437 + 1);
    
  } catch (error) {
    console.error('Error in checkSpecificTests:', JSON.stringify(error, null, 2));
  }
} 