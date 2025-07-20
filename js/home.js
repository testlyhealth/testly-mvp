import { $ } from './dom.js';
import { $all } from './dom.js';
import { categories } from './data.js';
import { blogPosts } from './blog-data.js';
import { CardService } from './services/cardService.js';

export async function displayHomePage() {
  console.log('displayHomePage running');
  // Try .product-grid, fallback to <main>
  let mainContent = document.querySelector('.product-grid') || document.querySelector('main');
  if (!mainContent) {
    console.error('No main content container found!');
    return;
  }
  
  // Create the dynamic title section
  const titleSection = `
    <section class="dynamic-title-section">
      <div class="title-container">
        <h1 class="main-title">
          <div class="static-text">Compare and book</div>
          <div class="dynamic-text">blood tests</div>
        </h1>
      </div>
    </section>
  `;
  
  // Create the hero section with 5 boxes
  const heroSection = `
    <section class="hero-grid">
      <div class="hero-box large">
        <video class="hero-video" autoplay muted playsinline style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;transform:translateX(15%);">
          <source src="images/scales-video.mp4" type="video/mp4">
        </video>
        <div class="box-content">
          <div class="box-text">
            <h2>Lose weight<br>with GLP-1s</h2>
          </div>
          <button class="cta-button">Get started <span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box large">
        <video class="hero-video" autoplay muted playsinline style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;filter:brightness(1.1);">
          <source src="images/man-laugh.mp4" type="video/mp4">
        </video>
        <div class="box-content">
          <div class="box-text">
            <h2>Is testosterone<br>for you?</h2>
          </div>
          <button class="cta-button">Get started <span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box small zepbound-box">
        <div class="box-content">
          <div class="box-text">
            <h3>Access Zepbound® in a vial</h3>
          </div>
          <button class="cta-button"><span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box small daily-rise-box">
        <div class="box-content">
          <div class="box-text">
            <h3>Have better sex with Daily Rise</h3>
          </div>
          <button class="cta-button"><span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box small hair-box">
        <div class="box-content">
          <div class="box-text">
            <h3>Regrow your hair</h3>
          </div>
          <button class="cta-button"><span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
    </section>
  `;

  // Create the tracking banner section
  const trackingBanner = `
    <section class="tracking-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h2>Track all your results across multiple providers</h2>
          <p>Get a complete view of your health journey with our unified dashboard</p>
          <button class="cta-button">View Dashboard</button>
        </div>
        <div class="banner-graph">
          <img src="images/graph.jpeg" alt="Upward trending graph" class="graph-image" style="width:100%;max-width:400px;display:block;margin:0 auto;" />
        </div>
      </div>
    </section>
  `;

  // Create the alternate banner with video
  const trackingBannerVideo = `
    <div style="position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;width:100vw;height:300px;overflow:hidden;">
      <video class="health-banner-video" autoplay muted playsinline style="position:absolute;top:0;left:0;width:100vw;height:100%;object-fit:cover;object-position:20% 50%;z-index:0;transform:scaleX(-1);margin:0;padding:0;">
        <source src="images/weight-loss-video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="banner-text" style="position:relative;z-index:2;text-align:left;max-width:500px;color:#fff;padding:3rem 0 3rem 4rem;margin:0;">
        <h2 style="color:#fff;text-shadow:0 2px 12px rgba(0,0,0,0.5);">Is weightloss medication right for you?</h2>
        <p style="font-size:1.1rem;color:#fff;margin-top:0.3rem;text-shadow:0 2px 12px rgba(0,0,0,0.5);">Find out here</p>
        <button class="cta-button" style="margin-top:1.2rem;">Get started <span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
      </div>
    </div>
  `;

  // Remove the trust indicators section
  // Add the 4 cheapest products section
  const cheapestProducts = [
    {
      name: "General health blood test",
      provider: "London Health Company",
      price: 33,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation"],
      url: "https://londonhealthcompany.co.uk/products/general-health-blood-test-15",
      logo: "images/logos/london health company.png",
      description: "Comprehensive health check covering liver, kidney, cholesterol, diabetes, thyroid, iron, vitamins and inflammation markers.",
      blood_taking_method: "Finger prick",
      results_returned: "2 days",
      doctors_report: "Yes",
      trustpilot_score: 4.8
    },
    {
      name: "Core blood test",
      provider: "Numan",
      price: 78.40,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation", "Hormones"],
      url: "https://www.numan.com/lps/gbr/blood-test/core-health-check",
      logo: "images/logos/numan.png",
      description: "Essential health markers including liver, kidney, cholesterol, diabetes, thyroid, iron, vitamins, inflammation and hormones.",
      blood_taking_method: "Finger prick",
      results_returned: "3 days",
      doctors_report: "Yes",
      trustpilot_score: 4.6
    },
    {
      name: "Health and lifestyle blood test",
      provider: "Medichecks",
      price: 89,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation", "Hormones", "Cardiovascular"],
      url: "https://www.medichecks.com/products/health-and-lifestyle-check-blood-test",
      logo: "images/logos/medichecks.png",
      description: "Comprehensive health and lifestyle assessment covering all major health markers and cardiovascular risk factors.",
      blood_taking_method: "Finger prick",
      results_returned: "2 days",
      doctors_report: "Yes",
      trustpilot_score: 4.7
    },
    {
      name: "General health profile",
      provider: "London Medical Laboratory",
      price: 89,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation", "Hormones", "Cardiovascular"],
      url: "https://www.londonmedicallaboratory.com/product/general-health",
      logo: "images/logos/london medical laboratory.png",
      description: "Complete general health profile with comprehensive biomarker analysis and professional interpretation.",
      blood_taking_method: "Finger prick",
      results_returned: "2 days",
      doctors_report: "Yes",
      trustpilot_score: 4.5
    },
    {
      name: "Essential blood test",
      provider: "Superdrug",
      price: 99,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron"],
      url: "https://www.superdrug.com/health-services/blood-tests/essential",
      logo: "images/logos/superdrug.png",
      description: "Essential health markers for basic health screening and monitoring.",
      blood_taking_method: "Finger prick",
      results_returned: "3 days",
      doctors_report: "No",
      trustpilot_score: 4.3
    },
    {
      name: "Wellness check",
      provider: "Bluecrest",
      price: 120,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation", "Hormones", "Cardiovascular", "Bone health"],
      url: "https://www.bluecrestwellness.com/blood-tests/wellness-check",
      logo: "images/logos/bluecrest.png",
      description: "Comprehensive wellness check including bone health markers and advanced cardiovascular screening.",
      blood_taking_method: "Finger prick",
      results_returned: "4 days",
      doctors_report: "Yes",
      trustpilot_score: 4.4
    },
    {
      name: "Baseline blood test",
      provider: "Thriva",
      price: 110,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation"],
      url: "https://thriva.co/products/baseline-blood-test",
      logo: "images/logos/thriva.png",
      description: "Baseline health assessment with comprehensive biomarker analysis and lifestyle recommendations.",
      blood_taking_method: "Finger prick",
      results_returned: "2 days",
      doctors_report: "Yes",
      trustpilot_score: 4.6
    },
    {
      name: "Vitality blood test",
      provider: "Forth",
      price: 105,
      biomarkers: ["Liver function", "Kidney function", "Cholesterol", "Diabetes", "Thyroid", "Iron", "Vitamins", "Inflammation", "Hormones", "Cardiovascular"],
      url: "https://www.forthwithlife.co.uk/blood-tests/vitality",
      logo: "images/logos/forth.png",
      description: "Vitality assessment focusing on energy, hormones and cardiovascular health markers.",
      blood_taking_method: "Finger prick",
      results_returned: "3 days",
      doctors_report: "Yes",
      trustpilot_score: 4.5
    }
  ];

  // Create blood test cards using CardService
  const cardService = new CardService();
  const bloodTestCards = await Promise.all(
    cheapestProducts.map(async (product, index) => {
      // Convert to the format expected by CardService
      const testData = {
        ...product,
        grouped_biomarkers: {
          "General Health": product.biomarkers
        }
      };
      return await cardService.createCard(testData, { rank: index + 1 });
    })
  );

  const cheapestSection = `
    <section class="cheapest-products-section">
      <div class="cheapest-products-grid cheapest-products-scroll" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; padding: 2rem;">
        ${bloodTestCards.join('')}
      </div>
    </section>
  `;

  // Create the blog section
  const blogSection = `
    <div class="blog-section">
      <h2>Latest health insights</h2>
      <div class="blog-grid">
        ${blogPosts.map(post => `
          <article class="blog-card" data-article-id="${post.id}">
            <div class="blog-card-header">
              <span class="blog-category">${post.category}</span>
              <span class="blog-read-time">${post.readTime}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div class="blog-card-footer">
              <span class="blog-date">${new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <a href="#/blog/${post.id}" class="read-more">Read more →</a>
            </div>
          </article>
        `).join('')}
      </div>
    </div>
  `;

  // Update the main content
  mainContent.innerHTML = titleSection + heroSection + trackingBannerVideo + cheapestSection + trackingBanner + blogSection;

  console.log('Setting up dynamic text animation');
  // Dynamic title text animation
  const dynamicText = document.querySelector('.dynamic-text');
  console.log('dynamicText element:', dynamicText);
  // Highlight the element being updated
  dynamicText.style.border = '2px solid red';
  // Log all .dynamic-text elements
  console.log('All .dynamic-text elements:', document.querySelectorAll('.dynamic-text'));
  const phrases = [
    'blood tests',
    'weight loss treatments',
    'hormone clinics',
    'supplements'
  ];
  let currentIndex = 0;

  // Clear any previous interval
  if (window.dynamicTextInterval) {
    clearInterval(window.dynamicTextInterval);
    window.dynamicTextInterval = null;
  }

  function updateDynamicText() {
    console.log('Updating dynamic text to:', phrases[currentIndex]);
    dynamicText.classList.add('fade-out');
    setTimeout(() => {
      dynamicText.textContent = phrases[currentIndex];
      dynamicText.classList.remove('fade-out');
      currentIndex = (currentIndex + 1) % phrases.length;
    }, 500);
  }

  // Initial update
  updateDynamicText();
  // Set up the interval for subsequent updates
  window.dynamicTextInterval = setInterval(updateDynamicText, 3000);
  console.log('Interval set:', window.dynamicTextInterval);

  // Set video playback rate and stop after one play for the weight loss banner
  const weightLossVideo = document.querySelector('.health-banner-video');
  if (weightLossVideo) {
    weightLossVideo.playbackRate = 0.75;
    weightLossVideo.pause();
    // Only play when visible
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          weightLossVideo.play();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(weightLossVideo);
    weightLossVideo.onended = function() {
      weightLossVideo.pause();
      weightLossVideo.currentTime = weightLossVideo.duration;
      observer.disconnect();
    };
  }

  // Stop the videos after first play
  const videos = document.querySelectorAll('.hero-video');
  videos.forEach((video, index) => {
    video.onended = function() {
      video.pause();
      if (index === 0) { // scales video
        video.currentTime = video.duration;
      } else { // testosterone video
        video.currentTime = video.duration - 20;
      }
    };
  });

  // Add click handlers to blog cards
  $('.blog-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.blog-card');
    if (card) {
      const articleId = card.dataset.articleId;
      window.location.hash = `#/blog/${articleId}`;
    }
  });

  // Add click handler to CTA buttons
  $all('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
      window.location.hash = '#/category/general-health';
    });
  });
}

function getCategoryIcon(categoryId) {
  const icons = {
    'general-health': 'fa-heartbeat',
    'weight-loss': 'fa-weight',
    'sleep': 'fa-moon',
    'hormones': 'fa-flask',
    'womens-health': 'fa-venus',
    'mens-health': 'fa-mars',
    'heart-health': 'fa-heart',
    'gut-health': 'fa-microscope',
    'supplements': 'fa-pills'
  };
  return icons[categoryId] || 'fa-heartbeat';
}

export function setupDynamicTextAnimation() {
  const dynamicText = document.querySelector('.dynamic-text');
  if (!dynamicText) return;
  const phrases = [
    'blood tests',
    'weight loss treatments',
    'hormone clinics',
    'supplements'
  ];
  let currentIndex = 0;

  if (window.dynamicTextInterval) {
    clearInterval(window.dynamicTextInterval);
    window.dynamicTextInterval = null;
  }

  function updateDynamicText() {
    dynamicText.classList.add('fade-out');
    setTimeout(() => {
      dynamicText.textContent = phrases[currentIndex];
      dynamicText.classList.remove('fade-out');
      currentIndex = (currentIndex + 1) % phrases.length;
    }, 500);
  }

  updateDynamicText();
  window.dynamicTextInterval = setInterval(updateDynamicText, 3000);
}