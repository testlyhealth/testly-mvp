// Home page component
export function displayHomePage() {
    return `
    <section class="dynamic-title-section">
      <div class="title-container">
        <h1 class="main-title">
          <div class="static-text">Compare and book</div>
          <div class="dynamic-text">blood tests</div>
        </h1>
      </div>
    </section>

    <section class="hero-grid-large">
      <div class="hero-box">
        <video class="hero-video" autoplay muted playsinline style="transform: translateX(20%);outline:none;border:none;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;">
          <source src="images/scales-video.mp4" type="video/mp4">
        </video>
        <div class="box-content">
          <div class="box-text">
            <h2>Lose weight<br>with GLP-1s</h2>
          </div>
          <button class="cta-button">Get started <span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box">
        <video class="hero-video" autoplay muted playsinline style="transform: scaleX(-1);outline:none;border:none;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;">
          <source src="images/man-laugh.mp4" type="video/mp4">
        </video>
        <div class="box-content">
          <div class="box-text">
            <h2>Is testosterone<br>for you?</h2>
          </div>
          <button class="cta-button">Get started <span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
    </section>

    <section class="hero-grid-small">
      <div class="hero-box small zepbound-box" style="background-color: #C9D6CC;">
        <img src="images/blood-vials.jpg" alt="Blood vials" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;">
        <div class="box-content">
          <div class="box-text" style="max-width:60%;padding-right:1rem;">
            <h3 style="font-size:1rem;line-height:1.4;">Find the right<br>blood test<br>for you</h3>
          </div>
          <button class="cta-button" style="position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);margin:0;"><span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box small daily-rise-box">
        <div class="box-content">
          <div class="box-text">
            <h3>Have better sex with Daily Rise</h3>
          </div>
          <button class="cta-button" style="position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);margin:0;"><span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
      <div class="hero-box small hair-box">
        <div class="box-content">
          <div class="box-text">
            <h3>Regrow your hair</h3>
          </div>
          <button class="cta-button" style="position:absolute;right:1.5rem;top:50%;transform:translateY(-50%);margin:0;"><span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
        </div>
      </div>
    </section>

    <div style="position:relative;left:50%;right:50%;margin-left:-50vw;margin-right:-50vw;width:100vw;height:300px;overflow:hidden;">
      <video class="health-banner-video" autoplay muted playsinline style="position:absolute;top:0;left:0;width:100vw;height:100%;object-fit:cover;object-position:20% 50%;z-index:0;transform:scaleX(-1);margin:0;padding:0;">
        <source src="images/weight-loss-video.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="banner-text" style="position:relative;z-index:2;text-align:left;max-width:500px;color:#fff;padding:2rem 0 2rem 4rem;margin:0;">
        <h2 style="color:#fff;text-shadow:0 2px 12px rgba(0,0,0,0.5);margin-bottom:0.5rem;">Is weight loss medication right for you?</h2>
        <p style="font-size:1.1rem;color:#fff;margin:0.3rem 0 1rem;text-shadow:0 2px 12px rgba(0,0,0,0.5);">Find out if you qualify for GLP-1 medication</p>
        <button class="cta-button" style="margin-top:0.5rem;">Get started <span class='arrow'><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 9h8m0 0l-3-3m3 3l-3 3" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>
      </div>
    </div>

    <section class="cheapest-products-section">
      <div class="cheapest-products-grid cheapest-products-scroll">
        <!-- Product cards will be dynamically loaded -->
      </div>
      <div class="cheapest-products-actions-row cheapest-products-scroll">
        <!-- Action buttons will be dynamically loaded -->
      </div>
    </section>

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

    <div class="blog-section">
      <h2>Latest health insights</h2>
      <div class="blog-grid">
        <!-- Blog posts will be dynamically loaded -->
      </div>
    </div>
    `;
}

function setupHomePageInteractions() {
    // Add any home page specific event listeners or functionality
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        // Add event listeners for product grid interactions
    }

    // Add event listener for the 'Find the right blood test for you' button
    const bloodTestBtn = document.querySelector('.hero-grid-small .zepbound-box .cta-button');
    if (bloodTestBtn) {
        bloodTestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#/blood-tests';
        });
    }
} 