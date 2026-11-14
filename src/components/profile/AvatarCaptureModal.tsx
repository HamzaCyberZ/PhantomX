import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Check,
  ImagePlus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';

interface AvatarCaptureModalProps {
  open: boolean;
  currentAvatar: string;
  userName: string;
  onSave: (dataUrl: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const AvatarCaptureModal: React.FC<AvatarCaptureModalProps> = ({
  open,
  currentAvatar,
  userName,
  onSave,
  onRemove,
  onClose,
}) => {
  const [mode, setMode] = useState<'choose' | 'camera' | 'preview'>('choose');
  const [draftUrl, setDraftUrl] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
      setMode('choose');
      setDraftUrl('');
      setCameraError('');
    }
    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    setCameraError('');
    setMode('camera');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera capture is not supported in this browser context. Please upload a photo from your gallery instead.',
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError(
        'Unable to access camera. Check browser permissions or upload an image from your gallery.',
      );
    }
  };

  const captureFromVideo = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror horizontally so selfie preview matches capture
    ctx.translate(400, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    stopCamera();
    setDraftUrl(dataUrl);
    setMode('preview');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);

        setDraftUrl(canvas.toDataURL('image/jpeg', 0.88));
        setMode('preview');
        setCameraError('');
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!draftUrl) return;
    onSave(draftUrl);
    onClose();
  };

  const handleRemove = () => {
    stopCamera();
    onRemove();
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Update profile picture"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[var(--np-surface)] border border-[var(--np-border)] rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle on mobile */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1.5 rounded-full bg-slate-400/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--np-border-subtle)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--np-text-primary)]">
              Profile Picture
            </h2>
            <p className="text-xs text-[var(--np-text-muted)]">
              Upload from gallery, capture via camera, or remove photo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo dialog"
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-xl text-[var(--np-text-secondary)] hover:text-[var(--np-text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {mode === 'choose' && (
            <>
              <div className="flex flex-col items-center py-2">
                <UserAvatar
                  src={currentAvatar}
                  name={userName}
                  sizeClass="w-28 h-28"
                  textClass="text-2xl"
                  roundedClass="rounded-3xl"
                />
                <p className="text-xs text-[var(--np-text-muted)] mt-3">
                  {currentAvatar ? 'Current profile photo' : 'Using monogram initials'}
                </p>
              </div>

              {cameraError && (
                <p className="text-xs text-rose-500 p-3 rounded-xl bg-rose-500/10">
                  {cameraError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span>Upload from Gallery</span>
                </button>

                <button
                  type="button"
                  onClick={startCamera}
                  className="min-h-[48px] px-4 py-3 rounded-xl bg-[var(--np-surface-elevated)] border border-[var(--np-border)] hover:border-sky-500/40 text-[var(--np-text-primary)] font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[var(--np-accent)]" />
                  <span>Capture Camera</span>
                </button>
              </div>

              {currentAvatar && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Current Photo</span>
                </button>
              )}
            </>
          )}

          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-[var(--np-border)]">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {!cameraReady && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                    Starting camera...
                  </div>
                )}
              </div>

              {cameraError && (
                <p className="text-xs text-rose-500 p-3 rounded-xl bg-rose-500/10">
                  {cameraError}
                </p>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setMode('choose');
                  }}
                  className="min-h-[44px] px-4 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-secondary)] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={captureFromVideo}
                  disabled={!cameraReady}
                  className="flex-1 min-h-[44px] px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'preview' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3 py-2">
                <img
                  src={draftUrl}
                  alt="Preview of new profile photo"
                  className="w-36 h-36 rounded-3xl object-cover border-2 border-sky-500/50 shadow-lg"
                />
                <p className="text-xs text-[var(--np-text-secondary)]">
                  Preview looks sharp. Save to apply across PhantomX.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDraftUrl('');
                    setMode('choose');
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[var(--np-border)] text-xs font-semibold text-[var(--np-text-primary)] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Choose Another</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
