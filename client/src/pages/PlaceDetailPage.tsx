import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { usePlace } from '../hooks/usePlaces';
import { useGeo } from '../hooks/useGeolocation';
import { useAuth } from '../hooks/useAuth';
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
  const { position, error: geoError, loading: locating, request } = useGeo();
  const { refreshMe } = useAuth();
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
          `You need to be within ${COLLECT_RADIUS_M} m — the server puts you ${formatDistance(Number(err.data.distanceM) || 0)} away.`,
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
          `That photo was taken ${formatDistance(Number(err.data.distanceM) || 0)} from here — it needs to be within ${formatDistance(PHOTO_RADIUS_M)}.`,
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

  return (
    <div className="px-4 pt-4 pb-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-2 flex h-11 w-11 items-center justify-center rounded-full text-2xl"
        aria-label="Back"
      >
        ‹
      </button>

      <div className={`mx-auto w-3/4 max-w-72 ${justCollected ? 'animate-stamp-down' : ''}`}>
        <StampSVG
          subject={place}
          photoUrl={place.stamp?.photoUrl}
          className={`w-full ${
            collected
              ? 'drop-shadow-[0_4px_10px_rgba(47,42,36,0.3)]'
              : 'opacity-60 grayscale contrast-[0.85]'
          }`}
        />
      </div>

      <h1 className="mt-5 text-center font-display text-3xl">{place.name}</h1>
      <p className="text-center text-sm tracking-widest text-ink-soft uppercase">{place.country}</p>
      {place.description && (
        <p className="mx-auto mt-3 max-w-80 text-center text-sm leading-relaxed text-ink-soft">
          {place.description}
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        {collected ? (
          <>
            <p
              className="mx-auto max-w-72 text-center font-display text-teal"
              data-testid="collected-line"
            >
              On {formatCollectedDate(place.stamp!.collectedAt)}, you added the {place.name} stamp
              to your collection.
            </p>
            {!place.stamp!.photoUrl && (
              <p className="max-w-72 text-center text-sm text-ink-soft">
                Make it yours — add your own picture of this place as the stamp.
              </p>
            )}
            <div className="flex gap-2">
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
            <Button onClick={request} disabled={locating} data-testid="enable-location">
              {locating ? 'Locating…' : 'Enable location to collect'}
            </Button>
            {geoError && <p className="max-w-72 text-center text-sm text-terracotta">{geoError}</p>}
          </>
        ) : inRange ? (
          <Button onClick={collect} disabled={collecting} data-testid="collect-button">
            {collecting ? 'Stamping…' : 'Collect stamp'}
          </Button>
        ) : (
          <>
            <Button disabled data-testid="collect-button">
              Collect stamp
            </Button>
            <p className="text-sm text-ink-soft" data-testid="too-far-line">
              Get within {COLLECT_RADIUS_M} m — you’re {formatDistance(distance!)} away.
            </p>
          </>
        )}
        {collectError && (
          <p className="max-w-72 text-center text-sm text-terracotta" role="alert">
            {collectError}
          </p>
        )}

        {!collected && (
          <div className="mt-4 w-full max-w-80 rounded-2xl border border-ink/10 bg-paper-light p-4 text-center">
            <h2 className="font-display text-lg">Been here before?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Upload a photo you took at this place. If its location info matches (within{' '}
              {formatDistance(PHOTO_RADIUS_M)}) — or the landmark itself is recognized — the stamp
              is yours, with your photo as the art.
            </p>
            <Button
              variant="outline"
              className="mt-3"
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
        <div className="mt-10 text-center">
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
