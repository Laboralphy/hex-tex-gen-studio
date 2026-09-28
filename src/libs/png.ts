/**
 * An `ImageData` as a PNG data URL, the form the map editor keeps its tiles in.
 */
export function imageToDataUrl(image: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext('2d')?.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png');
}
