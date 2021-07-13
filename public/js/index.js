/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateData } from './updateSettings';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const mapStuff = document.getElementById('mapstuff');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

//DELEGATION
if (mapBox && mapStuff) {
  const locations = JSON.parse(mapBox.dataset.locations);
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

if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateData(name, email);
  });
}
