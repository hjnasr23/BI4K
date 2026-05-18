import * as fabric from 'fabric';

export const exportCanvasAsDataUrl = (canvas: fabric.Canvas): string => {
  return canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
};

export const centerObject = (obj: fabric.Object, canvas: fabric.Canvas) => {
  obj.center();
  obj.setCoords();
  canvas.renderAll();
};
