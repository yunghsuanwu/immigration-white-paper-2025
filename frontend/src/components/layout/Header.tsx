import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, FileText, Home } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-purple-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Mic className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold">Speak Up on Pathways to Work</h1>
        </div>
        
        <nav className="flex space-x-4">
          <Link 
            to="/" 
            className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-purple-800"
          >
            <Home className="h-5 w-5 mr-1" />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/about" 
            className="flex items-center px-3 py-2 rounded-md transition-colors hover:bg-purple-800"
          >
            <FileText className="h-5 w-5 mr-1" />
            <span>About</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header