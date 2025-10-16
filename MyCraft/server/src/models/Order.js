import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false // cho phép đặt hàng không cần tài khoản
    },
    customerInfo: {
        name: {
            type: String,
            required: [true, "Tên khách hàng là bắt buộc"]
        },
        phone: {
            type: String,
            required: [true, "Số điện thoại là bắt buộc"],
            validate: {
                validator: function (v) {
                    return /^0[0-9]{9,10}$/.test(v);
                },
                message: "Số điện thoại không hợp lệ"
            }
        },
        address: {
            type: String,
            required: [true, "Địa chỉ là bắt buộc"]
        }
    },
    products: {
        type: [orderProductSchema],
        validate: {
            validator: arr => Array.isArray(arr) && arr.length > 0,
            message: "Đơn hàng phải có ít nhất 1 sản phẩm"
        }
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "Tổng tiền không hợp lệ"]
    },
    status: {
        type: String,
        enum: ["Đang chờ", "Đã xác nhận", "Đã gửi", "Đã hoàn thành", "Đã hủy"],
        default: "Đang chờ"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Order", orderSchema);
