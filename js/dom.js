// dom.js – shared DOM helpers for modular Testly project

// Select the first matching element
export function $(selector) {
    return document.querySelector(selector);
  }
  
  // Select all matching elements
  export function $all(selector) {
    return document.querySelectorAll(selector);
  }
  
  // Show an element
  export function show(el) {
    el.style.display = 'block';
  }
  
  // Hide an element
  export function hide(el) {
    el.style.display = 'none';
  }
  
  // Toggle visibility
  export function toggle(el) {
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
  }
  