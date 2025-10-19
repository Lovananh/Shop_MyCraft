import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Tên đăng nhập là bắt buộc"],
        unique: true,
        minlength: [6, "Tên đăng nhập ít nhất 6 ký tự"],
        maxlength: [30, "Tên đăng nhập tối đa 30 ký tự"],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Mật khẩu là bắt buộc"],
        minlength: [8, "Mật khẩu ít nhất 8 ký tự"],
        match: [
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/,
            "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 ký tự đặc biệt"
        ]
    },
    name: {
        type: String,
        required: [true, "Họ tên là bắt buộc"],
        match: [
            /^[A-Za-zÀ-ỹ\s]+ [A-Za-zÀ-ỹ\s]+$/,
            "Họ tên phải gồm ít nhất hai từ và chỉ chứa chữ cái"
        ],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Địa chỉ là bắt buộc"],
        default: ""
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
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    timestamp: true
});

//mã hóa Hash trước khi lưu
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// so sanh khop mat khau
userSchema.method.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// tối ưu hóa tìm kiếm theo username
userSchema.index({ index: 1 });
export default mongoose.model("User", userSchema);
