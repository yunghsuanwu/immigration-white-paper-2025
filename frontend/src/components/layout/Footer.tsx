import React from 'react';
import { ExternalLink, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-purple-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-purple-700 pb-2">About This Project</h3>
            <p className="text-sm leading-relaxed">
              This platform helps people affected by UK benefit changes share their voice
              on the government's 'Pathways to Work' Green Paper. Created by concerned citizens.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-purple-700 pb-2">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.gov.uk/government/consultations/pathways-to-work-reforming-benefits-and-support-to-get-britain-working-green-paper" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:text-purple-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Official Green Paper
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.uk/government/consultations/pathways-to-work-reforming-benefits-and-support-to-get-britain-working-green-paper#:~:text=an%20accessible%20format.-,Ways%20to%20respond,-Respond%20online" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:text-purple-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  How to Respond Directly
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-purple-800 text-sm text-center">
          <p className="text-sm pt-4 flex items-center justify-center">
            Made with <Heart className="h-4 w-4 mx-1 text-red-400" /> for fairness in the UK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer