import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image uploads are allowed"));
  }
};

const uploadProofImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).single("proofImage");

export default uploadProofImage;

export const uploadSingleImage = (fieldName) =>
  multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter,
  }).single(fieldName);

export const maybeUploadSingleImage = (fieldName) => {
  const upload = uploadSingleImage(fieldName);
  return (req, res, next) => {
    const ct = String(req.headers["content-type"] || "");
    if (!ct.toLowerCase().startsWith("multipart/form-data")) return next();
    return upload(req, res, next);
  };
};
