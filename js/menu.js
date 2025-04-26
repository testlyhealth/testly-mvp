import { $, $all } from './dom.js';
import { WelcomeOverlay } from './components/welcome-overlay.js';

// Create a single instance of WelcomeOverlay
const welcomeOverlay = new WelcomeOverlay();

export function setupMenuToggle() {
  console.log('Setting up menu toggle...');
  
  const menuButton = $('.menu-button');
  const dropdown = $('#burger-dropdown');
  const categoryBar = $('.category-bar');
  const categoryList = $('.category-list');

  console.log('Menu elements found:', {
    menuButton: menuButton ? 'Found' : 'Not found',
    dropdown: dropdown ? 'Found' : 'Not found'
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

  document.onclick = function(e) {
    console.log('Document clicked:', {
      target: e.target,
      isMenuButton: menuButton.contains(e.target),
      isDropdown: dropdown.contains(e.target)
    });
    
    // Only close if the click is outside both the menu button and the dropdown
    if (!menuButton.contains(e.target) && !dropdown.contains(e.target)) {
      console.log('Clicking outside, hiding dropdown');
      dropdown.classList.add('hidden');
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
