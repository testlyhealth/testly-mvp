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
  
  // DOM utility functions
  export function createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    return element;
  }
  
  export function addClass(element, className) {
    element.classList.add(className);
  }
  
  export function removeClass(element, className) {
    element.classList.remove(className);
  }
  
  export function toggleClass(element, className) {
    element.classList.toggle(className);
  }
  
  export function setText(element, text) {
    element.textContent = text;
  }
  
  export function setHTML(element, html) {
    element.innerHTML = html;
  }
  
  export function addEvent(element, event, handler) {
    element.addEventListener(event, handler);
  }
  
  export function removeEvent(element, event, handler) {
    element.removeEventListener(event, handler);
  }
  