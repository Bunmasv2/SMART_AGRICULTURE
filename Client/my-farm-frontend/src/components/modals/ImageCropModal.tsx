import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Crop as CropIcon, GripHorizontal, Loader2, X } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-image-crop/dist/ReactCrop.css';

const DRAG_TYPE = 'CROP_IMAGE_SOURCE';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
  onConfirm: (blob: Blob) => Promise<void> | void;
}

function createDefaultCrop(): Crop {
  return {
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  };
}

function CropSourceThumb({ imageUrl }: { imageUrl: string }) {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: DRAG_TYPE,
      item: { imageUrl },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [imageUrl]
  );

  return (
    <div
      ref={(node) => {
        dragRef(node);
      }}
      className={`cursor-grab overflow-hidden rounded-lg border border-slate-200 bg-white p-1 transition active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <img src={imageUrl} alt="Crop source" className="h-16 w-16 rounded object-cover" />
    </div>
  );
}

function CropEditor({ isOpen, imageUrl, title, onClose, onConfirm }: ImageCropModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<Crop>(createDefaultCrop);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: DRAG_TYPE,
      drop: () => {
        // The dropped source is the same image; drop gesture is used only for UX consistency.
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    }),
    []
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCrop(createDefaultCrop());
    setCompletedCrop(null);
    setError('');
    setIsSaving(false);
  }, [isOpen, imageUrl]);

  const canSave = useMemo(
    () => Boolean(imageRef.current && completedCrop && completedCrop.width > 0 && completedCrop.height > 0),
    [completedCrop]
  );

  const handleApplyCrop = async () => {
    if (!imageRef.current || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
      setError('Vui lòng chọn vùng cắt hợp lệ.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const source = imageRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = source.naturalWidth / source.width;
      const scaleY = source.naturalHeight / source.height;

      canvas.width = Math.max(1, Math.floor(completedCrop.width * scaleX));
      canvas.height = Math.max(1, Math.floor(completedCrop.height * scaleY));

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Trình duyệt không hỗ trợ xử lý crop ảnh.');
      }

      context.drawImage(
        source,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (output) => {
            if (output) {
              resolve(output);
              return;
            }
            reject(new Error('Không thể tạo ảnh sau khi crop.'));
          },
          'image/jpeg',
          0.9
        );
      });

      await onConfirm(blob);
      onClose();
    } catch (cropError) {
      const message = cropError instanceof Error ? cropError.message : 'Không thể crop ảnh';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-slate-800">{title ?? 'Crop Image'}</Dialog.Title>
                    <p className="mt-1 text-xs text-slate-500">Kéo vùng chọn để cắt ảnh, sau đó lưu thay thế ảnh hiện tại.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Đóng"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {imageUrl ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Nguồn ảnh</p>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                        <CropSourceThumb imageUrl={imageUrl} />
                        <div className="text-xs text-slate-500">
                          <p className="font-medium text-slate-700">Kéo ảnh vào vùng crop</p>
                          <p className="mt-1 inline-flex items-center gap-1">
                            <GripHorizontal className="h-3.5 w-3.5" />
                            Dùng chuột để chọn vùng cắt
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      ref={(node) => {
                        dropRef(node);
                      }}
                      className={`overflow-hidden rounded-xl border p-2 transition ${
                        isOver ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <ReactCrop
                        crop={crop}
                        onChange={(nextCrop) => setCrop(nextCrop)}
                        onComplete={(nextCompletedCrop) => setCompletedCrop(nextCompletedCrop)}
                        keepSelection
                      >
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt="Crop preview"
                          crossOrigin="anonymous"
                          className="max-h-[55vh] w-full rounded-lg object-contain"
                        />
                      </ReactCrop>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Chưa có ảnh để crop.
                  </div>
                )}

                {error ? (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleApplyCrop()}
                    disabled={!canSave || isSaving}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                      !canSave || isSaving
                        ? 'cursor-not-allowed bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CropIcon className="h-4 w-4" />}
                    Lưu ảnh đã crop
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function ImageCropModal(props: ImageCropModalProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <CropEditor {...props} />
    </DndProvider>
  );
}
