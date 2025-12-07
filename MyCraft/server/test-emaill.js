// test-email.js
require('dotenv').config();
require('./utils/mailer').initMailer().then(() => {
    require('./utils/mailer').sendVerificationEmail('loanh1265@gmail.com', 'test123456')
        .then(() => console.log('ĐÃ GỬI EMAIL TEST THÀNH CÔNG!'))
        .catch(err => console.error('Lỗi gửi test:', err));
});