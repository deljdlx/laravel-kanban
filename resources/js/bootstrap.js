import axios from 'axios';

import '@tabler/core/dist/js/tabler.min.js';
import "@tabler/core/dist/css/tabler.min.css";
import "@tabler/core/dist/css/tabler-vendors.min.css"; /* si tu veux les vendors (datepicker, etc.) */
// Font Awesome (installed via npm) – used in the sandbox navbar examples
import "@fortawesome/fontawesome-free/css/all.min.css";



window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
