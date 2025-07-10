import React from 'react';
import './NavbarSimple.css';

const NavbarSimple = () => {
    return (
        <nav className="navbar-simple">
            <div className="navbar-simple-container">
                <div className="navbar-simple-title">
                    <span className="navbar-simple-icon">📚</span>
                    Sistema UNIJovem
                </div>

                <div className="navbar-simple-info">
                    Gerenciamento de jovens da igreja
                </div>
            </div>
        </nav>
    );
};

export default NavbarSimple;