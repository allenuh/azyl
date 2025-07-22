import App from './App.js';

// Dom Elements ----------------------------------

// const domElements = elements({
//     canvas: ".experience-canvas",
// });

const container = document.getElementById('container');

const app = new App(container);
app.init();