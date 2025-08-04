import { supabase } from './js/api/supabase.js';

export async function fixLinkTable() {
  console.log('=== FIXING BLOOD TEST CATEGORY LINK TABLE ===');
  
  try {
    // 1. Check what category we're dealing with (General Health)
    console.log('1. Finding General Health category...');
    const { data: categoryRows, error: categoryError } = await supabase
      .from('blood_test_categories')
      .select('id, name')
      .eq('name', 'General Health');
    
    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      return;
    }
    
    console.log('General Health category:', categoryRows[0]);
    const categoryId = categoryRows[0]?.id;
    
    if (!categoryId) {
      console.error('General Health category not found');
      return;
    }
    
    // 2. Check current link table entries
    console.log('\n2. Checking current link table entries...');
    const { data: linkRows, error: linkError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id, blood_test_category_id')
      .eq('blood_test_category_id', categoryId);
    
    if (linkError) {
      console.error('Error fetching link rows:', linkError);
      return;
    }
    
    console.log('Current link table entries:', linkRows.length);
    console.log('Sample link IDs:', linkRows.slice(0, 10).map(l => l.provider_blood_test_id));
    
    // 3. Check if these IDs exist in provider_blood_tests
    console.log('\n3. Checking if link table IDs exist in provider_blood_tests...');
    const linkTestIds = linkRows.map(l => l.provider_blood_test_id);
    const { data: tests, error: testsError } = await supabase
      .from('provider_blood_tests')
      .select('id, name')
      .in('id', linkTestIds);
    
    if (testsError) {
      console.error('Error fetching tests:', testsError);
      return;
    }
    
    console.log('Tests found for link table IDs:', tests.length);
    console.log('Sample tests:', tests.slice(0, 5));
    
    // 4. Check what the actual problematic test IDs are
    console.log('\n4. Finding actual problematic tests...');
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
    
    // 5. Check if these actual test IDs are in the link table
    console.log('\n5. Checking if actual test IDs are in link table...');
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
    
    // 6. If actual test IDs are NOT in link table, add them
    console.log('\n6. Checking if we need to add missing links...');
    const existingActualTestIds = actualLinks.map(l => l.provider_blood_test_id);
    const missingTestIds = actualTestIds.filter(id => !existingActualTestIds.includes(id));
    
    console.log('Missing test IDs:', missingTestIds);
    
    if (missingTestIds.length > 0) {
      console.log('Adding missing links...');
      const newLinks = missingTestIds.map(testId => ({
        provider_blood_test_id: testId,
        blood_test_category_id: categoryId
      }));
      
      const { data: insertData, error: insertError } = await supabase
        .from('blood_test_category_link_table')
        .insert(newLinks);
      
      if (insertError) {
        console.error('Error inserting new links:', insertError);
        return;
      }
      
      console.log('Successfully added', newLinks.length, 'new links');
    } else {
      console.log('All actual test IDs are already in the link table');
    }
    
  } catch (error) {
    console.error('Error in fixLinkTable:', error);
  }
} 