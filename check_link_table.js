import { supabase } from './js/api/supabase.js';

export async function checkLinkTable() {
  console.log('=== CHECKING BLOOD TEST CATEGORY LINK TABLE ===');
  
  try {
    // 1. Check what's in the blood_test_category_link_table
    console.log('1. Checking blood_test_category_link_table...');
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id, blood_test_category_id')
      .limit(20);
    
    if (linkError) {
      console.error('Error fetching link table:', linkError);
      return;
    }
    
    console.log('Link table sample:', linkRows);
    console.log('Provider blood test IDs in link table:', linkRows.map(l => l.provider_blood_test_id));
    
    // 2. Check if these IDs exist in provider_blood_tests
    console.log('\n2. Checking if these IDs exist in provider_blood_tests...');
    const linkTestIds = linkRows.map(l => l.provider_blood_test_id);
    const { data: tests, error: testsError } = await supabase
      .from('provider_blood_tests')
      .select('id, name')
      .in('id', linkTestIds);
    
    if (testsError) {
      console.error('Error fetching tests:', testsError);
      return;
    }
    
    console.log('Tests found for link table IDs:', tests);
    
    // 3. Check what the actual problematic test IDs are
    console.log('\n3. Checking actual problematic test IDs...');
    const problematicTestNames = ['Testosterone Check', 'Testosterone Plus Profile', 'Well Man Premier Plus Profile', 'Sports Hormone Profile', 'Male Hormone Blood Test', 'Testosterone Blood Test'];
    const { data: problematicTests, error: problematicError } = await supabase
      .from('provider_blood_tests')
      .select('id, name, provider_id')
      .in('name', problematicTestNames);
    
    if (problematicError) {
      console.error('Error fetching problematic tests:', problematicError);
      return;
    }
    
    console.log('Actual problematic tests:', problematicTests);
    
    // 4. Check if these actual test IDs are in the link table
    console.log('\n4. Checking if actual test IDs are in link table...');
    const actualTestIds = problematicTests.map(t => t.id);
    const { data: actualLinks, error: actualLinksError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id, blood_test_category_id')
      .in('provider_blood_test_id', actualTestIds);
    
    if (actualLinksError) {
      console.error('Error fetching actual links:', actualLinksError);
      return;
    }
    
    console.log('Links for actual test IDs:', actualLinks);
    
  } catch (error) {
    console.error('Error in checkLinkTable:', error);
  }
} 