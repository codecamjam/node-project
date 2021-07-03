/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from 'mapbox';
import { login, logout } from './login';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const mapStuff = document.getElementById('mapstuff');
const loginForm = document.querySelector('.login-form');
const logOutBtn = document.querySelector('.nav__el--logout');

//VALUES
//we originally had an error placing these here
//because we tried to read these values when the page loads
//so move them into listener
// const email = document.getElementById('email').value;
// const password = document.getElementById('password').value;

//DELEGATION
if (mapBox && stuff) {
  const locations = JSON.parse(dataset.locations);
  const stuff = mapStuff.dataset.stuff.split(' ');
  const token = stuff[0];
  const styles = stuff[1];
  displayMap(locations, token, styles);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
