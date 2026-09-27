const allowed = ["image/jpeg", "image/png", "image/webp"];

export async function compressImage(file: File): Promise<Blob> {
  if (!allowed.includes(file.type))
    throw new Error("Choose a JPG, PNG, or WebP photo.");
  if (file.size > 8 * 1024 * 1024)
    throw new Error("Choose a photo smaller than 8 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot prepare the photo.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error("Could not prepare this photo. Try another.")),
        "image/webp",
        0.8,
      ),
    );
  } finally {
    bitmap.close();
  }
}

export function savePhoto(
  blob: Blob,
  onProgress: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable)
        onProgress(Math.round((event.loaded / event.total) * 100));
    };
    reader.onload = () => {
      onProgress(100);
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error("Could not save this photo."));
    reader.readAsDataURL(blob);
  });
}
