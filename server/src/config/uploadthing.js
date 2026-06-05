// server/src/config/uploadthing.js
const { createUploadthing } = require("uploadthing/express");

const f = createUploadthing();

const uploadRouter = {
  // Room images — max 8 files, 4MB each
  roomImages: f({ image: { maxFileSize: "4MB", maxFileCount: 8 } })
    .middleware(async ({ req }) => {
      // Auth check can be added here
      return { uploadedBy: req.user?.id || "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Room image uploaded:", file.url);
      return { url: file.url, key: file.key };
    }),

  // Avatar — single image, 2MB
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { uploadedBy: req.user?.id || "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Avatar uploaded:", file.url);
      return { url: file.url, key: file.key };
    }),

  // Vendor logo
  vendorLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { uploadedBy: req.user?.id || "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Vendor logo uploaded:", file.url);
      return { url: file.url, key: file.key };
    }),

  // Receipt / documents
  documents: f({ image: { maxFileSize: "4MB", maxFileCount: 3 } })
    .middleware(async ({ req }) => {
      return { uploadedBy: req.user?.id || "anonymous" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Document uploaded:", file.url);
      return { url: file.url, key: file.key };
    }),
};

module.exports = { f, uploadRouter };
