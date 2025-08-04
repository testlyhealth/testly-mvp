import { supabase } from './js/api/supabase.js';

export async function addMissingBiomarkers() {
  console.log('=== ADDING MISSING BIOMARKER LINKS ===');
  
  const missingTestIds = [436, 437];
  
  try {
    // 1. Check what these tests are
    console.log('1. Checking what tests 436 and 437 are...');
    const { data: tests, error: testsError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .in('id', missingTestIds);
    
    if (testsError) {
      console.error('Error fetching tests:', testsError);
      return;
    }
    
    console.log('Tests to add biomarkers to:', tests);
    
    // 2. Check what biomarkers exist in the database
    console.log('\n2. Checking available biomarkers...');
    const { data: biomarkers, error: biomarkersError } = await supabase
      .from('biomarkers')
      .select('id, name')
      .order('name');
    
    if (biomarkersError) {
      console.error('Error fetching biomarkers:', biomarkersError);
      return;
    }
    
    console.log('Available biomarkers:', biomarkers.length);
    console.log('Sample biomarkers:', biomarkers.slice(0, 10));
    
    // 3. Determine what biomarkers each test should have based on name
    for (const test of tests) {
      console.log(`\n3. Determining biomarkers for "${test.name}" (ID: ${test.id})...`);
      
      const testName = test.name.toLowerCase();
      let suggestedBiomarkers = [];
      
      if (testName.includes('testosterone')) {
        suggestedBiomarkers.push('Testosterone');
      }
      if (testName.includes('hormone') || testName.includes('hormones')) {
        suggestedBiomarkers.push('Testosterone');
        suggestedBiomarkers.push('Free Testosterone');
        suggestedBiomarkers.push('Sex Hormone Binding Globulin');
        suggestedBiomarkers.push('Luteinising Hormone');
        suggestedBiomarkers.push('Follicle Stimulating Hormone');
        suggestedBiomarkers.push('Oestradiol');
        suggestedBiomarkers.push('Prolactin');
      }
      if (testName.includes('male')) {
        suggestedBiomarkers.push('Testosterone');
        suggestedBiomarkers.push('Free Testosterone');
        suggestedBiomarkers.push('Sex Hormone Binding Globulin');
      }
      
      console.log(`Suggested biomarkers for "${test.name}":`, suggestedBiomarkers);
      
      // 4. Find the biomarker IDs for these suggested biomarkers
      const biomarkerIds = [];
      for (const biomarkerName of suggestedBiomarkers) {
        const biomarker = biomarkers.find(b => 
          b.name.toLowerCase() === biomarkerName.toLowerCase() ||
          b.name.toLowerCase().includes(biomarkerName.toLowerCase()) ||
          biomarkerName.toLowerCase().includes(b.name.toLowerCase())
        );
        if (biomarker) {
          biomarkerIds.push(biomarker.id);
          console.log(`Found biomarker "${biomarker.name}" (ID: ${biomarker.id}) for "${biomarkerName}"`);
        } else {
          console.log(`No biomarker found for "${biomarkerName}"`);
        }
      }
      
      console.log(`Biomarker IDs to add for test ${test.id}:`, biomarkerIds);
      
      // 5. Add the biomarker links to the database
      if (biomarkerIds.length > 0) {
        console.log(`\n4. Adding ${biomarkerIds.length} biomarker links for test ${test.id}...`);
        
        const linksToAdd = biomarkerIds.map(biomarkerId => ({
          provider_blood_test_id: test.id,
          biomarker_id: biomarkerId
        }));
        
        const { data: insertedLinks, error: insertError } = await supabase
          .from('biomarker_link_table')
          .insert(linksToAdd)
          .select();
        
        if (insertError) {
          console.error(`Error inserting biomarker links for test ${test.id}:`, insertError);
        } else {
          console.log(`✅ Successfully added ${insertedLinks.length} biomarker links for test ${test.id}`);
          console.log('Added links:', insertedLinks);
        }
      } else {
        console.log(`❌ No biomarkers to add for test ${test.id}`);
      }
    }
    
    console.log('\n=== COMPLETED ===');
    
  } catch (error) {
    console.error('Error in addMissingBiomarkers:', error);
  }
} 