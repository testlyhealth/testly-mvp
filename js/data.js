// Sample data structure for categories and products
export const categories = {
  'general-health': {
    title: 'General health',
    description: 'Comprehensive health check-ups and basic screenings',
    products: [
      {
        id: 'gh-001',
        name: 'Basic health check',
        price: 99.99,
        description: 'Essential health markers including cholesterol, blood sugar, and liver function',
        biomarkers: ['cholesterol', 'blood-sugar', 'liver-function']
      },
      {
        id: 'gh-002',
        name: 'Full body check',
        price: 149.99,
        description: 'Comprehensive health screening covering all major systems',
        biomarkers: ['cholesterol', 'blood-sugar', 'liver-function', 'kidney-function', 'thyroid']
      }
    ]
  },
  'weight-loss': {
    title: 'Weight loss',
    description: 'Tests to help understand your metabolism and weight management',
    products: [
      {
        id: 'wl-001',
        name: 'Metabolism check',
        price: 129.99,
        description: 'Understand your metabolic rate and hormone balance',
        biomarkers: ['thyroid', 'cortisol', 'insulin']
      }
    ]
  },
  'sleep': {
    title: 'Sleep',
    description: 'Tests to understand your sleep patterns and quality',
    products: [
      {
        id: 'sl-001',
        name: 'Sleep quality assessment',
        price: 119.99,
        description: 'Comprehensive sleep analysis and recommendations',
        biomarkers: ['melatonin', 'cortisol', 'sleep-patterns']
      }
    ]
  },
  'hormones': {
    title: 'Hormones',
    description: 'Comprehensive hormone testing and analysis',
    products: [
      {
        id: 'ho-001',
        name: 'Hormone balance check',
        price: 159.99,
        description: 'Complete hormone panel for men and women',
        biomarkers: ['testosterone', 'estrogen', 'thyroid', 'cortisol']
      }
    ]
  },
  'womens-health': {
    title: "Women's health",
    description: 'Specialized testing for women\'s health concerns',
    products: [
      {
        id: 'wh-001',
        name: 'Women\'s health panel',
        price: 139.99,
        description: 'Comprehensive women\'s health screening',
        biomarkers: ['estrogen', 'progesterone', 'thyroid', 'vitamin-d']
      }
    ]
  },
  'mens-health': {
    title: "Men's health",
    description: 'Specialized testing for men\'s health concerns',
    products: [
      {
        id: 'mh-001',
        name: 'Men\'s health panel',
        price: 139.99,
        description: 'Comprehensive men\'s health screening',
        biomarkers: ['testosterone', 'psa', 'thyroid', 'vitamin-d']
      }
    ]
  },
  'heart-health': {
    title: 'Heart health',
    description: 'Tests to monitor and maintain heart health',
    products: [
      {
        id: 'hh-001',
        name: 'Heart health check',
        price: 129.99,
        description: 'Comprehensive heart health screening',
        biomarkers: ['cholesterol', 'triglycerides', 'homocysteine', 'crp']
      }
    ]
  },
  'gut-health': {
    title: 'Gut health',
    description: 'Tests to understand your digestive health',
    products: [
      {
        id: 'gh-001',
        name: 'Gut health analysis',
        price: 149.99,
        description: 'Comprehensive gut health screening',
        biomarkers: ['microbiome', 'inflammation', 'digestive-enzymes']
      }
    ]
  },
  'supplements': {
    title: 'Supplements',
    description: 'Personalized supplement recommendations based on your needs',
    products: [
      {
        id: 'sp-001',
        name: 'Supplement consultation',
        price: 89.99,
        description: 'Personalized supplement plan based on your test results',
        biomarkers: ['vitamin-d', 'b12', 'iron', 'magnesium']
      }
    ]
  }
}; 