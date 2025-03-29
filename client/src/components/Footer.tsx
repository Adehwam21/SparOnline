import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-green-900 text-white py-4 px-8 flex justify-between items-center">
            <div className="flex text-sm">
                © {new Date().getFullYear()} Spar Online. All rights reserved.
            </div>
            <div className="hidden lg:flex lg:flex-grow lg:justify-end space-x-6">
                <a href="/about" className="hover:underline hover:text-gold">About Spar</a>
                <a href="/faq" className="hover:underline hover:text-gold">FAQ</a>
                <a href="/terms" className="hover:underline hover:text-gold">Terms of Service</a>
                <a href="/privacy" className="hover:underline hover:text-gold">Privacy Policy</a>
                <a href="/github" className="hover:underline hover:text-gold">GitHub</a>
                <a href="/contact" className="hover:underline hover:text-gold">Buy me coffee</a>
            </div>
        </footer>
    );
}

export default Footer;