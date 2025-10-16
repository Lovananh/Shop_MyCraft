
//Tạo helper chuyển error từ Mongoose -> JSON rõ ràng:
export const formatMongooseError = (err) => {
  if (!err || !err.errors) return { message: err.message || "Lỗi server" };
  const errors = {};
  for (const key in err.errors) {
    errors[key] = err.errors[key].message;
  }
  return { message: "Validation error", errors };
};