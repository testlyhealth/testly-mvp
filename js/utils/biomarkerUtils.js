// Function to group biomarkers by category
export async function getGroupedBiomarkers(biomarkers) {
  const groups = new Map();
  
  biomarkers.forEach(biomarker => {
    // Extract the group name from the biomarker string
    // Assuming format: "Group Name: Biomarker Name"
    const [group, name] = biomarker.split(':').map(s => s.trim());
    const groupName = group || 'Other';
    
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName).push(name || biomarker);
  });
  
  return groups;
} 