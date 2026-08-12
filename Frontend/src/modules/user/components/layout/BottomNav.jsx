import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiGift, FiShoppingCart, FiUser, FiTrash2, FiCalendar } from 'react-icons/fi';
import { HiHome, HiGift, HiShoppingCart, HiUser, HiTrash, HiCalendar } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../../../context/CartContext';

// Unified brand teal theme for all nav items
const BRAND_TEAL = '#347989';
const navItemColors = {
  home: {
    primary: BRAND_TEAL,
    gradient: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #2a6170 100%)`,
    bg: 'rgba(52, 121, 137, 0.1)',
    shadow: 'rgba(52, 121, 137, 0.4)'
  },
  bookings: {
    primary: BRAND_TEAL,
    gradient: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #2a6170 100%)`,
    bg: 'rgba(52, 121, 137, 0.1)',
    shadow: 'rgba(52, 121, 137, 0.4)'
  },
  scrap: {
    primary: BRAND_TEAL,
    gradient: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #2a6170 100%)`,
    bg: 'rgba(52, 121, 137, 0.1)',
    shadow: 'rgba(52, 121, 137, 0.4)'
  },
  cart: {
    primary: BRAND_TEAL,
    gradient: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #2a6170 100%)`,
    bg: 'rgba(52, 121, 137, 0.1)',
    shadow: 'rgba(52, 121, 137, 0.4)'
  },
  account: {
    primary: BRAND_TEAL,
    gradient: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #2a6170 100%)`,
    bg: 'rgba(52, 121, 137, 0.1)',
    shadow: 'rgba(52, 121, 137, 0.4)'
  }
};

const BottomNav = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const { cartCount } = useCart();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: FiHome, filledIcon: HiHome, path: '/user' },
    { id: 'bookings', label: 'Bookings', icon: FiCalendar, filledIcon: HiCalendar, path: '/user/my-bookings' },
    { id: 'scrap', label: 'Scrap', icon: FiTrash2, filledIcon: HiTrash, path: '/user/scrap' },
    { id: 'cart', label: 'Cart', icon: FiShoppingCart, filledIcon: HiShoppingCart, path: '/user/cart', isCart: true },
    { id: 'account', label: 'Account', icon: FiUser, filledIcon: HiUser, path: '/user/account' },
  ], []);

  const getActiveTab = () => {
    if (location.pathname === '/user' || location.pathname === '/user/') return 'home';
    if (location.pathname === '/user/my-bookings') return 'bookings';
    if (location.pathname === '/user/scrap') return 'scrap';
    if (location.pathname === '/user/cart') return 'cart';
    if (location.pathname === '/user/account') return 'account';
    return 'home';
  };

  const activeTab = getActiveTab();
  const activeIndex = navItems.findIndex(item => item.id === activeTab);
  const activeColor = navItemColors[activeTab];



  // Update indicator position when active tab changes
  useEffect(() => {
    if (navRef.current) {
      const buttons = navRef.current.querySelectorAll('button');
      if (buttons[activeIndex]) {
        const button = buttons[activeIndex];
        const navRect = navRef.current.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - navRect.left + (buttonRect.width / 2) - 16, // Center the 32px indicator
          width: 32
        });
      }
    }
  }, [activeIndex, activeTab]);

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <nav
      className="fixed bottom-3 left-3 right-3 z-50 max-w-lg mx-auto lg:hidden"
      style={{
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div
        className="w-full px-3 py-2.5 rounded-full relative"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 36px -4px rgba(52, 121, 137, 0.2), 0 4px 16px -2px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <div ref={navRef} className="flex items-center justify-around relative">

          {/* Animated Sliding Highlight Pill */}
          <motion.div
            className="absolute h-10 rounded-full pointer-events-none"
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 32
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(52, 121, 137, 0.12) 0%, rgba(214, 143, 53, 0.1) 100%)',
              border: '1px solid rgba(52, 121, 137, 0.25)',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />

          {navItems.map((item) => {
            const IconComponent = activeTab === item.id ? item.filledIcon : item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleTabClick(item.path)}
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center w-14 h-11 rounded-full transition-all duration-200 relative z-10"
              >
                <div className="relative flex flex-col items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  >
                    <IconComponent
                      className="w-5 h-5 transition-colors duration-200"
                      style={{
                        color: isActive ? BRAND_TEAL : '#9CA3AF',
                      }}
                    />
                    {item.isCart && cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[9px] font-extrabold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center border-2 border-white shadow-md"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </motion.div>
                  <motion.span
                    animate={{
                      color: isActive ? BRAND_TEAL : '#6B7280',
                      fontWeight: isActive ? 700 : 500
                    }}
                    className="text-[10px] tracking-tight mt-0.5"
                  >
                    {item.label}
                  </motion.span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
