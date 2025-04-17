// modules.js
import { createModuleAChart } from './moduleA.js';
import { createModuleBChart } from './moduleB.js';
import { createModuleCChart } from './moduleC.js';
import { createModuleDChart } from './moduleD.js';
import { createModuleEScatter, createModuleEBarChart } from './moduleE.js';

const sharedTooltip = d3.select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

function debounce(fn, wait=300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function initializeModules() {
  if (document.querySelector('.module-a')) createModuleAChart();
  if (document.querySelector('.module-b')) createModuleBChart(sharedTooltip);
  if (document.querySelector('.module-c')) createModuleCChart(sharedTooltip);
  if (document.querySelector('.module-d')) createModuleDChart(sharedTooltip);
  if (document.querySelector('.module-e')) {
    createModuleEScatter(sharedTooltip);
    createModuleEBarChart(sharedTooltip);
  }
}

document.addEventListener('DOMContentLoaded', initializeModules);
window.addEventListener('resize', debounce(initializeModules));