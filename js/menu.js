import { $, $all } from './dom.js';
import { WelcomeOverlay } from './components/welcome-overlay.js';
import { supabase } from './api/supabase.js';

// Create a single instance of WelcomeOverlay
const welcomeOverlay = new WelcomeOverlay();

let cachedCategories = null;

export function setupMenuToggle() {
  console.log('Setting up menu toggle...');
  
  const menuButton = $('.menu-button');
  const dropdown = $('#burger-dropdown');
  const categoryBar = $('.category-bar');
  const categoryList = $('.category-list');
  const bloodTestsLink = $('.blood-tests-link');
  const bloodTestsMenu = $('.blood-tests-menu');

  console.log('Menu elements found:', {
    menuButton: menuButton ? 'Found' : 'Not found',
    dropdown: dropdown ? 'Found' : 'Not found',
    bloodTestsLink: bloodTestsLink ? 'Found' : 'Not found',
    bloodTestsMenu: bloodTestsMenu ? 'Found' : 'Not found'
  });

  if (!menuButton || !dropdown) {
    console.error('Menu elements not found!');
    return;
  }

  // Test if elements are in the DOM
  console.log('Menu button in DOM:', document.body.contains(menuButton));
  console.log('Dropdown in DOM:', document.body.contains(dropdown));

  // Test if hidden class is working
  console.log('Initial dropdown state:', dropdown.classList.contains('hidden'));

  // Restore original All menu functionality
  menuButton.onclick = function(e) {
    console.log('Menu button clicked');
    e.preventDefault();
    e.stopPropagation();
    
    const wasHidden = dropdown.classList.contains('hidden');
    dropdown.classList.toggle('hidden');
    console.log('Dropdown toggled:', {
      wasHidden,
      isNowHidden: dropdown.classList.contains('hidden')
    });
  };

  // Set up blood tests menu functionality
  if (bloodTestsLink && bloodTestsMenu) {
    bloodTestsLink.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle blood tests menu
      const wasHidden = bloodTestsMenu.classList.contains('hidden');
      bloodTestsMenu.classList.toggle('hidden');
      
      // Hide other menus
      dropdown.classList.add('hidden');
      
      console.log('Blood tests menu toggled:', {
        wasHidden,
        isNowHidden: bloodTestsMenu.classList.contains('hidden')
      });
    };
  }

  document.onclick = function(e) {
    console.log('Document clicked:', {
      target: e.target,
      isMenuButton: menuButton.contains(e.target),
      isDropdown: dropdown.contains(e.target),
      isBloodTestsLink: bloodTestsLink?.contains(e.target),
      isBloodTestsMenu: bloodTestsMenu?.contains(e.target)
    });
    
    // Close All menu if click is outside
    if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
      console.log('Clicking outside All menu, hiding dropdown');
      dropdown.classList.add('hidden');
    }
    
    // Close blood tests menu if click is outside
    if (bloodTestsLink && bloodTestsMenu && 
        !bloodTestsLink.contains(e.target) && !bloodTestsMenu.contains(e.target)) {
      console.log('Clicking outside blood tests menu, hiding menu');
      bloodTestsMenu.classList.add('hidden');
    }
  };

  // Test dropdown items
  const dropdownItems = $all('#burger-dropdown li');
  console.log('Dropdown items found:', dropdownItems.length);

  // Convert NodeList to Array for checking
  const dropdownItemsArray = Array.from(dropdownItems);
  
  dropdownItemsArray.forEach((item, index) => {
    item.onclick = function() {
      console.log(`Dropdown item ${index} clicked:`, this.textContent);
      
      if (this.classList.contains('menu-blog')) {
        // Handle blog navigation
        window.location.hash = '#/blog';
      } else if (this.classList.contains('guide-me')) {
        // Handle Guide me button
        welcomeOverlay.showOverlay();
      } else {
        // Handle category navigation
        const categoryId = this.textContent.toLowerCase().replace(/\s+/g, '-');
        console.log('Navigating to category:', categoryId);
        
        // Update the URL hash to reflect the category
        window.location.hash = `#/category/${categoryId}`;
        
        import('./products.js').then(module => {
          module.displayCategoryProducts(categoryId);
        });
      }
      dropdown.classList.add('hidden');
    };
  });

  // Test if event listeners are attached
  console.log('Event listeners attached:', {
    menuButton: menuButton.onclick ? 'Yes' : 'No',
    bloodTestsLink: bloodTestsLink?.onclick ? 'Yes' : 'No',
    document: document.onclick ? 'Yes' : 'No',
    dropdownItems: dropdownItemsArray.every(item => item.onclick) ? 'All items' : 'Some missing'
  });

  // Check for overflow and update indicators
  function checkOverflow() {
    if (!categoryList || !categoryBar) return;
    const hasOverflow = categoryList.scrollWidth > categoryList.clientWidth;
    const isScrolledLeft = categoryList.scrollLeft > 0;
    const isScrolledRight = categoryList.scrollLeft < (categoryList.scrollWidth - categoryList.clientWidth - 1);
    
    categoryBar.classList.toggle('has-overflow', isScrolledRight);
    categoryBar.classList.toggle('has-overflow-left', isScrolledLeft);
  }

  // Check on load and resize
  if (categoryList && categoryBar) {
    window.addEventListener('load', checkOverflow);
    window.addEventListener('resize', checkOverflow);
    categoryList.addEventListener('scroll', checkOverflow);
  }
}

export function renderNewBloodTestsMenu() {
  const bloodTestsMenu = document.querySelector('.blood-tests-menu');
  if (!bloodTestsMenu) return;

  bloodTestsMenu.style.position = 'fixed';
  bloodTestsMenu.style.top = '64px';
  bloodTestsMenu.style.left = '0';
  bloodTestsMenu.style.width = '100vw';
  bloodTestsMenu.style.zIndex = '1100';
  bloodTestsMenu.style.background = 'transparent';
  bloodTestsMenu.style.display = 'block';
  bloodTestsMenu.style.justifyContent = 'center';
  bloodTestsMenu.style.alignItems = 'flex-start';
  bloodTestsMenu.style.border = 'none';
  bloodTestsMenu.style.boxShadow = 'none';

  bloodTestsMenu.innerHTML = `
    <div class=\"new-menu-dropdown\" style=\"display: flex; width: 100vw; background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border-radius: 0 0 10px 10px; overflow: hidden; font-family: 'Segoe UI', sans-serif; margin: 0 auto;\">
      <div class=\"menu-left-col\" style=\"flex: 0 0 220px; background: #f8f8f8; padding: 1.5rem 0; display: flex; flex-direction: column; gap: 0.5rem; border-right: 1px solid #eee; min-height: 220px;\">
        <button class=\"menu-col-btn adv-search\" style=\"background: none; border: none; text-align: left; font-size: 1rem; font-weight: 500; color: #111; padding: 0.75rem 2rem; cursor: pointer; transition: background 0.15s;\">Advanced search</button>
        <button class=\"menu-col-btn categories\" style=\"background: none; border: none; text-align: left; font-size: 1rem; font-weight: 500; color: #111; padding: 0.75rem 2rem; cursor: pointer; transition: background 0.15s; position:relative;\">Categories<span class=\"chevron\" style=\"font-weight:bold;position:absolute;right:18px;top:50%;transform:translateY(-50%);color:#222;pointer-events:none;opacity:1;\">&rsaquo;</span></button>
        <button class=\"menu-col-btn find-test\" style=\"background: none; border: none; text-align: left; font-size: 1rem; font-weight: 500; color: #111; padding: 0.75rem 2rem; cursor: pointer; transition: background 0.15s;\">Find the right test</button>
      </div>
      <div class=\"menu-right-col\" style=\"flex: 1 1 auto; min-width: 0; padding: 1.5rem; min-height: 220px; display:none;\">
        <!-- Right column will be populated later -->
      </div>
    </div>
  `;

  bloodTestsMenu.querySelector('.adv-search').onclick = () => {
    window.location.hash = '#/advanced';
    bloodTestsMenu.classList.add('hidden');
  };

  const categoriesBtn = bloodTestsMenu.querySelector('.categories');
  const rightCol = bloodTestsMenu.querySelector('.menu-right-col');

  let rightColVisible = false;
  let hideTimeout = null;

  // Show categories on mouseenter/focus
  categoriesBtn.addEventListener('mouseenter', showCategories);
  categoriesBtn.addEventListener('focus', showCategories);
  // Hide categories on mouseleave/blur
  categoriesBtn.addEventListener('mouseleave', tryHideCategories);
  categoriesBtn.addEventListener('blur', tryHideCategories);
  rightCol.addEventListener('mouseenter', () => {
    cancelHideCategories();
    categoriesBtn.classList.add('menu-col-btn-active');
  });
  rightCol.addEventListener('mouseleave', tryHideCategories);

  function showCategories() {
    if (rightColVisible) return;
    rightCol.style.display = 'block';
    rightCol.innerHTML = '<div style="padding:2rem;text-align:center;">Loading categories...</div>';
    rightColVisible = true;
    categoriesBtn.classList.add('menu-col-btn-active');
    if (cachedCategories) {
      rightCol.innerHTML = renderCategoriesList(cachedCategories);
      return;
    }
    supabase.from('blood_test_categories').select('*').order('name').then(({ data, error }) => {
      if (error) {
        rightCol.innerHTML = '<div style="color:red;">Failed to load categories</div>';
        return;
      }
      cachedCategories = data;
      rightCol.innerHTML = renderCategoriesList(data);
    });
  }
  function tryHideCategories() {
    hideTimeout = setTimeout(() => {
      rightCol.style.display = 'none';
      rightCol.innerHTML = '';
      rightColVisible = false;
      categoriesBtn.classList.remove('menu-col-btn-active');
    }, 120);
  }
  function cancelHideCategories() {
    if (hideTimeout) clearTimeout(hideTimeout);
  }

  bloodTestsMenu.querySelector('.find-test').onclick = () => {
    window.location.hash = '#/guide-me';
    bloodTestsMenu.classList.add('hidden');
  };
}

function renderCategoriesList(categories) {
  if (!categories || categories.length === 0) {
    return '<div style="padding:2rem;">No categories found.</div>';
  }
  // Add a <style> block for right column hover/focus effects if not present
  if (!document.getElementById('menu-category-hover-style')) {
    const style = document.createElement('style');
    style.id = 'menu-category-hover-style';
    style.innerHTML = `
      .menu-category-link {
        display: block;
        padding: 0.5rem 0;
        font-size: 1rem;
        color: #222;
        text-decoration: none;
        border-radius: 4px;
        position: relative;
        transition: box-shadow 0.18s cubic-bezier(.4,0,.2,1), transform 0.18s cubic-bezier(.4,0,.2,1);
      }
      .menu-category-link:hover, .menu-category-link:focus {
        /* No background */
        box-shadow: 0 2px 8px 0 rgba(80,120,200,0.07);
        transform: scale(1.03);
        outline: none;
      }
    `;
    document.head.appendChild(style);
  }
  // Sort alphabetically by name
  const sorted = [...categories].sort((a, b) => a.name.localeCompare(b.name));
  // Always use 3 columns
  const numCols = 3;
  const perCol = Math.ceil(sorted.length / numCols);
  const columns = Array.from({ length: numCols }, (_, i) =>
    sorted.slice(i * perCol, (i + 1) * perCol)
  );
  // Render as columns with even smaller black bullet points, and animated hover/focus
  return `<div style=\"display: flex; gap: 2rem;\">
    ${columns
      .map(
        col => `<ul style=\"list-style:none;padding:0;margin:0;\">
          ${col
            .map(
              cat => `<li style=\"display:flex;align-items:center;\"><span style=\"display:inline-block;width:4px;height:4px;background:#111;border-radius:50%;margin-right:0.75em;\"></span><a href=\"#/category/${encodeURIComponent(cat.slug || cat.name)}?filter=${encodeURIComponent(cat.name)}\" class=\"menu-category-link\">${cat.name}</a></li>`
            )
            .join('')}
        </ul>`
      )
      .join('')}
  </div>`;
}

// Add a <style> block for left column hover/focus effects and chevron
if (!document.getElementById('menu-leftcol-hover-style')) {
  const style = document.createElement('style');
  style.id = 'menu-leftcol-hover-style';
  style.innerHTML = `
    .menu-col-btn {
      position: relative;
      transition: background 0.15s, border 0.15s;
    }
    .menu-col-btn:hover, .menu-col-btn:focus, .menu-col-btn-active {
      background: #f0f4fa !important;
      border-radius: 4px;
      outline: none;
    }
    .menu-col-btn.categories .chevron {
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.1em;
      color: #222;
      font-weight: bold;
      pointer-events: none;
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

// Initialize the new blood tests menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
  renderNewBloodTestsMenu();
});
