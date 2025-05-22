import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-700 text-lg">Analyse de Sentiment</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/" className="py-4 px-2 text-gray-700 font-semibold hover:text-blue-500 transition duration-300">
              Flux en Temps Réel
            </Link>
            <Link to="/dashboard" className="py-4 px-2 text-gray-700 font-semibold hover:text-blue-500 transition duration-300">
              Tableau de Bord
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;