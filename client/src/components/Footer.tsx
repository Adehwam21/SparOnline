import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-white py-4 px-8 flex justify-between  h-16 items-center rounded-t-2xl">
            <div className="flex text-sm">
                © {new Date().getFullYear()} Spar Online. All rights reserved.
            </div>
            <div className="hidden lg:flex lg:flex-grow lg:justify-end space-x-6">
                {/* <a href="/learn" className="hover:text-yellow-300 transition">About Spar</a> */}
                {/* <a href="/faq" className="hover:text-yellow-300 transition">FAQ</a> */}
                {/* <a href="/terms" className="hover:text-yellow-300 transition">Terms of Service</a> */}
                {/* <a href="/privacy" className="hover:text-yellow-300 transition">Privacy Policy</a> */}
                <a href="https://github.com/Adehwam21/SparOnline" className="hover:text-yellow-300 transition">Contribute</a>
            </div>
        </footer>
    );
}

export default Footer;
