import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { usePlace } from '../hooks/usePlaces';
import { useGeo } from '../hooks/useGeolocation';
import { useAuth } from '../hooks/useAuth';
import { useUnits } from '../hooks/useUnits';
import { api, ApiError, formatCollectedDate } from '../lib/api';
import { fileToStampPhoto } from '../lib/image';
import { extractGps } from '../lib/exif';
import { COLLECT_RADIUS_M, PHOTO_RADIUS_M, formatDistance, haversineMeters } from '../lib/geo';
import { Button } from '../components/Button';
import { StampSVG } from '../art/StampSVG';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { place, error, refresh } = usePlace(id);
  const { position } = useGeo();
  const { refreshMe } = useAuth();
  const { units } = useUnits();
  const [collectError, setCollectError] = useState<string | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [justCollected, setJustCollected] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const proofInput = useRef<HTMLInputElement>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [verifyingProof, setVerifyingProof] = useState(false);

  if (error) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-sm text-terracotta">{error}</p>
        <Link to="/" className="mt-3 inline-block text-sm underline underline-offset-2">
          Back to passport
        </Link>
      </div>
    );
  }
  if (!place) {
    return <p className="mt-16 text-center text-sm text-ink-soft">Loading…</p>;
  }

  const collected = place.stamp !== null;
  const distance = position
    ? haversineMeters(position.lat, position.lng, place.lat, place.lng)
    : null;
  const inRange = distance !== null && distance <= COLLECT_RADIUS_M;

  const collect = async () => {
    if (!position) return;
    setCollecting(true);
    setCollectError(null);
    try {
      await api.post(`/api/places/${place.id}/collect`, {
        lat: position.lat,
        lng: position.lng,
      });
      setJustCollected(true);
      await Promise.all([refresh(), refreshMe()]);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'TOO_FAR') {
        setCollectError(
          `You need to be within ${formatDistance(COLLECT_RADIUS_M, units)} — the server puts you ${formatDistance(Number(err.data.distanceM) || 0, units)} away.`,
        );
      } else if (err instanceof ApiError && err.code === 'ALREADY_COLLECTED') {
        await refresh();
      } else {
        setCollectError('Could not collect the stamp. Try again.');
      }
    } finally {
      setCollecting(false);
    }
  };

  const onPhotoPicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    setSavingPhoto(true);
    setPhotoError(null);
    try {
      const dataUrl = await fileToStampPhoto(file);
      await api.put(`/api/places/${place!.id}/photo`, { photo: dataUrl });
      await refresh();
    } catch {
      setPhotoError('Could not save that picture. Try a different image.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const onProofPicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setVerifyingProof(true);
    setProofError(null);
    try {
      const gps = await extractGps(file);
      const dataUrl = await fileToStampPhoto(file);
      await api.post(`/api/places/${place!.id}/collect-photo`, {
        photo: dataUrl,
        photoLat: gps?.lat,
        photoLng: gps?.lng,
      });
      setJustCollected(true);
      await Promise.all([refresh(), refreshMe()]);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PHOTO_TOO_FAR') {
        setProofError(
          `That photo was taken ${formatDistance(Number(err.data.distanceM) || 0, units)} from here — it needs to be within ${formatDistance(PHOTO_RADIUS_M, units)}.`,
        );
      } else if (err instanceof ApiError && err.code === 'PHOTO_NO_LOCATION') {
        setProofError(
          err.data.landmarkCheckAvailable
            ? 'That photo has no location info, and it couldn’t be matched to this place. Try a photo with location enabled or a clearer shot of the landmark.'
            : 'That photo has no location info. Use a photo taken with location enabled, or collect in person.',
        );
      } else if (err instanceof ApiError && err.code === 'PHOTO_NOT_RECOGNIZED') {
        setProofError('That photo couldn’t be matched to this place. Try a clearer shot of the landmark.');
      } else if (err instanceof ApiError && err.code === 'VERIFICATION_UNAVAILABLE') {
        setProofError('Photo verification is temporarily unavailable. Try again in a moment.');
      } else if (err instanceof ApiError && err.code === 'ALREADY_COLLECTED') {
        await refresh();
      } else {
        setProofError('Could not use that picture. Try a different image.');
      }
    } finally {
      setVerifyingProof(false);
    }
  };

  const removePlace = async () => {
    if (!window.confirm(`Delete “${place.name}” and its stamp?`)) return;
    await api.delete(`/api/places/${place.id}`);
    await refreshMe();
    navigate('/', { replace: true });
  };

  const heroTone =
    place.category === 'city'
      ? 'from-[#ffdfa8] via-[#fff0d3] to-[#fff9ee]'
      : place.category === 'us-state'
        ? 'from-[#ccefd7] via-[#e8f8ed] to-[#f8fcf9]'
        : 'from-[#c9e5ff] via-[#e7f4ff] to-[#f9fcff]';

  return (
    <div className="px-4 pt-3 pb-8">
      <section className={`relative overflow-hidden rounded-[34px] bg-gradient-to-br ${heroTone} px-5 pt-5 pb-7 shadow-[0_22px_62px_rgba(24,32,52,0.13)]`}>
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full border-[34px] border-white/30" />
        <svg className="pointer-events-none absolute inset-x-0 top-20 h-32 w-full opacity-30" viewBox="0 0 360 130" preserveAspectRatio="none" aria-hidden>
          <path d="M-15 105 C58 26 122 145 201 60 S300 16 379 55" fill="none" stroke="#1d1d1f" strokeWidth="1.1" strokeDasharray="4 8" className="animate-route-dash" />
        </svg>

        <div className="relative z-10 flex items-center justify-between">
          <motion.button
            type="button"
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.88 }}
            className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/70 bg-white/65 text-2xl shadow-sm backdrop-blur-xl"
            aria-label="Back"
          >
            ‹
          </motion.button>
          <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase ${collected ? 'bg-ink text-white' : 'border border-white/70 bg-white/55 text-ink-soft backdrop-blur-xl'}`}>
            {collected ? 'In your passport' : 'Locked stamp'}
          </span>
        </div>

        <div className={`relative z-10 mx-auto mt-3 w-[68%] max-w-64 ${justCollected ? 'animate-stamp-down' : ''}`}>
          {collected ? (
            <button
              type="button"
              onClick={() => uploadInput.current?.click()}
              disabled={savingPhoto}
              className="block w-full text-left transition-transform active:scale-[0.98] disabled:active:scale-100"
              aria-label={place.stamp!.photoUrl ? 'Replace stamp photo' : 'Add a photo for this stamp'}
              data-testid="stamp-photo-tap-target"
            >
              <StampSVG
                subject={place}
                photoUrl={place.stamp?.photoUrl}
                className="w-full drop-shadow-[0_14px_24px_rgba(24,32,52,0.22)]"
              />
              <span className="pointer-events-none absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-[13px] border border-white/25 bg-ink/85 shadow-lg backdrop-blur-xl">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
                  <path d="M4 7h3.2L9 4.5h6L16.8 7H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 2.2a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6Zm0 1.8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                </svg>
              </span>
            </button>
          ) : (
            <StampSVG
              subject={place}
              photoUrl={place.stamp?.photoUrl}
              className="w-full saturate-[0.9] drop-shadow-[0_14px_24px_rgba(24,32,52,0.18)]"
            />
          )}
        </div>

        <div className="relative z-10 mt-4 text-center">
          <p className="eyebrow text-ink-soft">
            {place.category === 'us-state' && place.state ? place.state : place.country}
          </p>
          <h1 className="mt-1.5 font-display text-[31px] leading-[1.05]">{place.name}</h1>
          {place.description && (
            <p className="mx-auto mt-3 max-w-80 text-[13px] leading-relaxed text-ink-soft">
              {place.description}
            </p>
          )}
          {distance !== null && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/58 px-3 py-1.5 text-[10px] font-bold text-ink-soft backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              {formatDistance(distance, units)} from your saved location
            </span>
          )}
        </div>
      </section>

      <div className="mt-3 flex flex-col items-center gap-3 rounded-[28px] border border-white/70 bg-white/66 px-4 py-5 shadow-[0_16px_46px_rgba(24,32,52,0.09)] backdrop-blur-xl">
        {collected ? (
          <>
            <div className="w-full rounded-[20px] bg-ink px-4 py-4 text-center text-white">
              <p className="eyebrow text-white/45">Stamped into your story</p>
              <p className="mx-auto mt-1.5 max-w-72 font-display text-[17px] leading-snug" data-testid="collected-line">
                On {formatCollectedDate(place.stamp!.collectedAt)}, you added the {place.name} stamp
                to your collection.
              </p>
            </div>
            {!place.stamp!.photoUrl && (
              <p className="max-w-72 text-center text-[13px] leading-relaxed text-ink-soft">
                Make it yours — tap the stamp above to take or upload a photo of this place.
              </p>
            )}
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={savingPhoto}
                onClick={() => cameraInput.current?.click()}
                data-testid="take-photo"
              >
                {savingPhoto ? 'Saving…' : place.stamp!.photoUrl ? 'Retake photo' : 'Take photo'}
              </Button>
              <Button
                variant="outline"
                disabled={savingPhoto}
                onClick={() => uploadInput.current?.click()}
                data-testid="upload-photo"
              >
                Upload image
              </Button>
            </div>
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={onPhotoPicked}
              data-testid="photo-camera-input"
            />
            <input
              ref={uploadInput}
              type="file"
              accept="image/*"
              hidden
              onChange={onPhotoPicked}
              data-testid="photo-upload-input"
            />
            {photoError && (
              <p className="max-w-72 text-center text-sm text-terracotta" role="alert">
                {photoError}
              </p>
            )}
          </>
        ) : !position ? (
          <>
            <Button disabled className="w-full" data-testid="collect-button">
              Location unavailable
            </Button>
            <p className="max-w-72 text-center text-[13px] leading-relaxed text-ink-soft">
              Location was not enabled when you signed in. You can still collect this stamp with
              a photo below.
            </p>
          </>
        ) : inRange ? (
          <Button className="w-full" onClick={collect} disabled={collecting} data-testid="collect-button">
            {collecting ? 'Stamping…' : 'Collect stamp'}
          </Button>
        ) : (
          <>
            <Button disabled className="w-full" data-testid="collect-button">
              Collect stamp
            </Button>
            <p className="text-sm text-ink-soft" data-testid="too-far-line">
              Get within {formatDistance(COLLECT_RADIUS_M, units)} — you’re{' '}
              {formatDistance(distance!, units)} away.
            </p>
          </>
        )}
        {collectError && (
          <p className="max-w-72 text-center text-sm text-terracotta" role="alert">
            {collectError}
          </p>
        )}

        {!collected && (
          <div className="mt-2 w-full overflow-hidden rounded-[22px] border border-black/5 bg-[linear-gradient(145deg,#fff4df,#ffffff)] p-4 text-center shadow-sm">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-[13px] bg-coral/12 text-coral">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                <path d="M4 7h3.2L9 4.5h6L16.8 7H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm8 2.2a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6Z" />
              </svg>
            </span>
            <h2 className="mt-2 font-display text-[19px]">Already part of your story?</h2>
            <p className="mx-auto mt-1 max-w-72 text-[12px] leading-relaxed text-ink-soft">
              Upload a photo you took at this place. If its location info matches (within{' '}
              {formatDistance(PHOTO_RADIUS_M, units)}) — or the landmark itself is recognized — the
              stamp is yours, with your photo as the art.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full"
              disabled={verifyingProof}
              onClick={() => proofInput.current?.click()}
              data-testid="collect-with-photo"
            >
              {verifyingProof ? 'Checking photo…' : 'Collect with a photo'}
            </Button>
            <input
              ref={proofInput}
              type="file"
              accept="image/*"
              hidden
              onChange={onProofPicked}
              data-testid="proof-photo-input"
            />
            {proofError && (
              <p className="mt-2 text-sm text-terracotta" role="alert">
                {proofError}
              </p>
            )}
          </div>
        )}
      </div>

      {place.isMine && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={removePlace}
            className="text-sm text-terracotta underline underline-offset-2"
          >
            Delete this place
          </button>
        </div>
      )}
    </div>
  );
}
