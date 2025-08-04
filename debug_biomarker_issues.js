// Debug Biomarker Issues Script
// This script will help identify why some tests show 0 biomarkers while others work correctly

import { supabase } from './js/api/supabase.js';

async function debugBiomarkerIssues() {
  console.log('=== BIOMARKER DEBUGGING SCRIPT ===');
  
  try {
    // 1. Check if "Testosterone" biomarker exists in the database
    console.log('\n1. Checking if "Testosterone" biomarker exists...');
    const { data: testosteroneBiomarker, error: biomarkerError } = await supabase
      .from('biomarkers')
      .select('id, name')
      .ilike('name', '%testosterone%');
    
    if (biomarkerError) {
      console.error('Error fetching testosterone biomarker:', biomarkerError);
      return;
    }
    
    console.log('Testosterone biomarkers found:', testosteroneBiomarker);
    
    if (testosteroneBiomarker.length === 0) {
      console.error('❌ No testosterone biomarker found in database!');
      return;
    }
    
    // 2. Check which tests have testosterone biomarker links
    console.log('\n2. Checking which tests have testosterone biomarker links...');
    const testosteroneBiomarkerIds = testosteroneBiomarker.map(b => b.id);
    
    const { data: testosteroneLinks, error: linkError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('biomarker_id', testosteroneBiomarkerIds);
    
    if (linkError) {
      console.error('Error fetching testosterone links:', linkError);
      return;
    }
    
    console.log('Testosterone biomarker links found:', testosteroneLinks.length);
    console.log('Sample links:', testosteroneLinks.slice(0, 5));
    
    // 3. Get the actual test details for tests with testosterone
    console.log('\n3. Getting test details for tests with testosterone...');
    const testIdsWithTestosterone = [...new Set(testosteroneLinks.map(l => l.provider_blood_test_id))];
    
    const { data: testsWithTestosterone, error: testError } = await supabase
      .from('provider_blood_tests')
      .select(`
        id, 
        name, 
        provider_id,
        providers(name)
      `)
      .in('id', testIdsWithTestosterone);
    
    if (testError) {
      console.error('Error fetching tests with testosterone:', testError);
      return;
    }
    
    console.log('Tests with testosterone found:', testsWithTestosterone.length);
    console.log('Sample tests:', testsWithTestosterone.slice(0, 5));
    
    // 4. Check which of these tests are in the men's health category
    console.log('\n4. Checking which testosterone tests are in men\'s health category...');
    const { data: categoryLinks, error: categoryError } = await supabase
      .from('blood_test_category_link_table')
      .select('provider_blood_test_id')
      .eq('blood_test_category_id', 3)
      .in('provider_blood_test_id', testIdsWithTestosterone);
    
    if (categoryError) {
      console.error('Error fetching category links:', categoryError);
      return;
    }
    
    const testIdsInCategory = categoryLinks.map(l => l.provider_blood_test_id);
    const testsInCategory = testsWithTestosterone.filter(t => testIdsInCategory.includes(t.id));
    
    console.log('Tests with testosterone in men\'s health category:', testsInCategory.length);
    console.log('Tests in category:', testsInCategory.map(t => ({
      id: t.id,
      name: t.name,
      provider: t.providers?.name
    })));
    
    // 5. Check for data type mismatches
    console.log('\n5. Checking for data type mismatches...');
    const biomarkerLinkTypes = testosteroneLinks.map(l => ({
      provider_blood_test_id: l.provider_blood_test_id,
      provider_blood_test_id_type: typeof l.provider_blood_test_id,
      biomarker_id: l.biomarker_id,
      biomarker_id_type: typeof l.biomarker_id
    }));
    
    console.log('Biomarker link data types:', biomarkerLinkTypes.slice(0, 5));
    
    // 6. Check if there are any tests that should have testosterone but don't
    console.log('\n6. Checking for missing testosterone links...');
    const allTestIds = testsWithTestosterone.map(t => t.id);
    const testIdsWithLinks = [...new Set(testosteroneLinks.map(l => l.provider_blood_test_id))];
    const testIdsWithoutLinks = allTestIds.filter(id => !testIdsWithLinks.includes(id));
    
    console.log('Test IDs without testosterone links:', testIdsWithoutLinks);
    
    // 7. Test the biomarker enrichment function
    console.log('\n7. Testing biomarker enrichment function...');
    
    // Simulate the fetchAndEnrichTests function
    const testIdsToEnrich = testIdsInCategory.slice(0, 10); // Test with first 10
    
    // Get biomarker links for these tests
    const { data: allBiomarkerLinks, error: allLinksError } = await supabase
      .from('biomarker_link_table')
      .select('provider_blood_test_id, biomarker_id')
      .in('provider_blood_test_id', testIdsToEnrich);
    
    if (allLinksError) {
      console.error('Error fetching all biomarker links:', allLinksError);
      return;
    }
    
    // Get all biomarker IDs
    const allBiomarkerIds = [...new Set(allBiomarkerLinks.map(l => l.biomarker_id))];
    
    // Get biomarker details
    const { data: allBiomarkers, error: allBiomarkersError } = await supabase
      .from('biomarkers')
      .select('id, name')
      .in('id', allBiomarkerIds);
    
    if (allBiomarkersError) {
      console.error('Error fetching all biomarkers:', allBiomarkersError);
      return;
    }
    
    // Simulate enrichment for each test
    console.log('\nEnrichment simulation results:');
    testIdsToEnrich.forEach(testId => {
      const links = allBiomarkerLinks.filter(l => l.provider_blood_test_id === testId);
      const biomarkerNames = links.map(link => {
        const biomarker = allBiomarkers.find(b => b.id === link.biomarker_id);
        return biomarker ? biomarker.name : null;
      }).filter(Boolean);
      
      console.log(`Test ID ${testId}: ${biomarkerNames.length} biomarkers - ${biomarkerNames.join(', ')}`);
    });
    
    // 8. Check for case sensitivity issues
    console.log('\n8. Checking for case sensitivity issues...');
    const testosteroneNames = testosteroneBiomarker.map(b => b.name);
    console.log('Testosterone biomarker names in database:', testosteroneNames);
    
    // Test case sensitivity matching
    const testSearchTerms = ['testosterone', 'Testosterone', 'TESTOSTERONE', 'testosterone+', 'Testosterone+'];
    testSearchTerms.forEach(term => {
      const normalizedTerm = term.toLowerCase().replace(/\+/g, ' ');
      const matches = testosteroneNames.filter(name => 
        name.toLowerCase().replace(/\+/g, ' ') === normalizedTerm
      );
      console.log(`Search term "${term}" (normalized: "${normalizedTerm}") matches:`, matches);
    });
    
    console.log('\n=== DEBUGGING COMPLETE ===');
    
  } catch (error) {
    console.error('Error in debugging script:', error);
  }
}

// Run the debugging script
debugBiomarkerIssues(); 