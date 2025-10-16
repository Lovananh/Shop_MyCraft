import React from 'react';

const fakeProducts = [
    { id: 1, name: 'Vòng tay thủ công', description: 'Vòng tay đan tay đẹp', price: 150000 },
    { id: 2, name: 'Túi vải handmade', description: 'Túi vải thân thiện môi trường', price: 250000 },
    { id: 3, name: 'Bình hoa gốm', description: 'Bình hoa gốm độc đáo', price: 350000 },
];

function ProductList() {
    return React.createElement(
        'div',
        { className: 'product-list' },
        React.createElement('h2', null, 'Danh sách sản phẩm'),
        React.createElement(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap' } },
            fakeProducts.map((product) =>
                React.createElement(
                    'div',
                    { key: product.id, className: 'product-card' },
                    React.createElement('h3', null, product.name),
                    React.createElement('p', null, product.description),
                    React.createElement('p', null, `Giá: ${product.price} VND`)
                )
            )
        )
    );
}

export default ProductList;