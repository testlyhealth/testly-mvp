import { $ } from './dom.js';
import { $all } from './dom.js';
import { categories } from './data.js';
import { blogPosts } from './blog-data.js';

export function displayHomePage() {
  const mainContent = $('.product-grid');
  
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
      provider: "London Health Company",
      test_name: "General health blood test",
      price: 33,
      biomarkers: 15,
      logo: "images/logos/london health company.png",
      link: "https://londonhealthcompany.co.uk/products/general-health-blood-test-15"
    },
    {
      provider: "Numan",
      test_name: "Core blood test",
      price: 78.40,
      biomarkers: 16,
      logo: "images/logos/numan.png",
      link: "https://www.numan.com/lps/gbr/blood-test/core-health-check"
    },
    {
      provider: "Medichecks",
      test_name: "Health and lifestyle blood test",
      price: 89,
      biomarkers: 19,
      logo: "images/logos/medichecks.png",
      link: "https://www.medichecks.com/products/health-and-lifestyle-check-blood-test"
    },
    {
      provider: "London Medical Laboratory",
      test_name: "General health profile",
      price: 89,
      biomarkers: 19,
      logo: "images/logos/london medical laboratory.png",
      link: "https://www.londonmedicallaboratory.com/product/general-health"
    },
    // Additional 4 placeholder products
    {
      provider: "Superdrug",
      test_name: "Essential blood test",
      price: 99,
      biomarkers: 12,
      logo: "images/logos/superdrug.png",
      link: "https://www.superdrug.com/health-services/blood-tests/essential"
    },
    {
      provider: "Bluecrest",
      test_name: "Wellness check",
      price: 120,
      biomarkers: 18,
      logo: "images/logos/bluecrest.png",
      link: "https://www.bluecrestwellness.com/blood-tests/wellness-check"
    },
    {
      provider: "Thriva",
      test_name: "Baseline blood test",
      price: 110,
      biomarkers: 14,
      logo: "images/logos/thriva.png",
      link: "https://thriva.co/products/baseline-blood-test"
    },
    {
      provider: "Forth",
      test_name: "Vitality blood test",
      price: 105,
      biomarkers: 17,
      logo: "images/logos/forth.png",
      link: "https://www.forthwithlife.co.uk/blood-tests/vitality"
    }
  ];

  const cheapestSection = `
    <section class="cheapest-products-section">
      <div class="cheapest-products-grid cheapest-products-scroll">
        ${cheapestProducts.map(product => `
          <div class="cheapest-product-card">
            <div class="cheapest-product-content">
              <div class="cheapest-product-provider">${product.provider}</div>
              <h3>${product.test_name}</h3>
              <img src="${product.logo}" alt="${product.provider} logo" class="cheapest-product-logo" />
              <div class="cheapest-product-biomarkers">${product.biomarkers} biomarkers</div>
              <div class="cheapest-product-price">£${product.price.toFixed(2)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="cheapest-products-actions-row cheapest-products-scroll">
        ${cheapestProducts.map(product => `
          <div class="cheapest-product-actions">
            <a href="${product.link}" class="cheapest-btn get-started" target="_blank">Get started</a>
            <a href="${product.link}" class="cheapest-btn learn-more" target="_blank">Learn more</a>
          </div>
        `).join('')}
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

  // Dynamic title text animation
  const dynamicText = document.querySelector('.dynamic-text');
  const phrases = [
    'blood tests',
    'weight loss treatments',
    'hormone clinics',
    'supplements'
  ];
  let currentIndex = 0;

  function updateDynamicText() {
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
  setInterval(updateDynamicText, 3000);

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