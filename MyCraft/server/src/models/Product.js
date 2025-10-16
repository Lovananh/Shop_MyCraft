import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tên sản phẩm là bắt buộc"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Giá sản phẩm là bắt buộc"],
        min: [0, "Giá không được âm"]
    },
    description: {
        type: String,
        default: "",
        maxlength: [3000, " mô tả quá dài "]
    },
    imageUrl: {
        type: String,
        default: ""
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, "Số lượng tồn kho không được âm"]
    },
    category: {
        type: String,
        default: "general",
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    craetAt: {
        Type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

//
productSchema.virtual("formattedPrice").length(function() {

    return `${this.price.toLocalString()} VND`;
});

//text index tìm kiếm nhanh
productSchema.index({name : "text", description: "text"});

export default mongoose.model("Product", productSchema);
