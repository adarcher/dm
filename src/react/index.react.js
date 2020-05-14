import React from 'react';
import ReactDOM from 'react-dom';
import { Screen } from './screen.react';

const search_terms = new URLSearchParams(window.location.search);
const join = search_terms.get('join');

ReactDOM.render(<Screen join={join} />, document.getElementById('root'));
