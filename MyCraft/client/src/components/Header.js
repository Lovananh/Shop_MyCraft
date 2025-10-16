import React from 'react';

function Header() {
    return React.createElement(
        'header',
        null,
        React.createElement('h1', null, 'MyCraft'),
        React.createElement(
            'nav',
            null,
            React.createElement('a', { href: '/' }, 'Trang chủ'),
            React.createElement('a', { href: '/products', style: { marginLeft: '1rem' } }, 'Sản phẩm'),
            React.createElement('a', { href: '/cart', style: { marginLeft: '1rem' } }, 'Giỏ hàng')
        )
    );
}

export default Header;