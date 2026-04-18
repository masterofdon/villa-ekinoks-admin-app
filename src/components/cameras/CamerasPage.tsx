'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { notification } from 'antd';

interface CameraDevice {
  serialNumber: string;
  name: string;
  model: string;
  stationSerial: string;
}

interface CameraPlayerProps {
  camera: CameraDevice;
}

const CameraPlayer: React.FC<CameraPlayerProps> = ({ camera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const jmuxerRef = useRef<unknown>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stopStream = useCallback(async () => {
    if (readerRef.current) {
      await readerRef.current.cancel();
      readerRef.current = null;
    }
    if (jmuxerRef.current) {
      (jmuxerRef.current as { destroy: () => void }).destroy();
      jmuxerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const startStream = useCallback(async () => {
    if (!videoRef.current) return;
    setIsLoading(true);

    try {
      // Dynamically import jmuxer (browser-only)
      const { default: JMuxer } = await import('jmuxer');

      jmuxerRef.current = new JMuxer({
        node: videoRef.current,
        mode: 'video',
        flushingTime: 500,
        fps: 20,
        debug: false,
        onError: () => {
          notification.error({ message: `Stream error for ${camera.name}` });
          stopStream();
        },
      });

      const response = await fetch(`/api/cameras/${camera.serialNumber}/stream`);

      if (!response.ok || !response.body) {
        throw new Error(`Failed to start stream: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      readerRef.current = reader;
      setIsStreaming(true);
      setIsLoading(false);

      // Feed chunks to jmuxer
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done || !jmuxerRef.current) break;
          (jmuxerRef.current as { feed: (data: { video: Uint8Array }) => void }).feed({
            video: value,
          });
        }
        stopStream();
      };

      pump().catch(() => stopStream());
    } catch (error) {
      console.error('Failed to start camera stream:', error);
      notification.error({ message: `Failed to start stream for ${camera.name}` });
      setIsLoading(false);
    }
  }, [camera.name, camera.serialNumber, stopStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Camera header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div>
          <p className="text-sm font-semibold text-gray-800">{camera.name}</p>
          <p className="text-xs text-gray-500">{camera.model} · {camera.serialNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />{' '}
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          autoPlay
          muted
          playsInline
        />

        {/* Overlay when not streaming */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M4 8a2 2 0 012-2h9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
              />
            </svg>
            <p className="text-gray-400 text-sm">Camera offline</p>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Connecting...</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 px-4 py-3">
        {isStreaming ? (
          <button
            onClick={stopStream}
            className="flex-1 py-1.5 px-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Stop Stream
          </button>
        ) : (
          <button
            onClick={startStream}
            disabled={isLoading}
            className="flex-1 py-1.5 px-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Start Live Stream'}
          </button>
        )}
      </div>
    </div>
  );
};

export const CamerasPage: React.FC = () => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await fetch('/api/cameras');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? 'Failed to load cameras');
        }
        const data = await res.json();
        setCameras(data.cameras);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        notification.error({ message: 'Failed to load cameras', description: msg });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameras();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-[12px] py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cameras</h1>
      <p className="text-gray-500 text-sm mb-8">
        Live streams from your Eufy security cameras.
      </p>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Connecting to Eufy…</p>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium">Could not connect to Eufy</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <p className="text-gray-500 text-xs mt-3">
            Make sure <code className="bg-gray-100 px-1 rounded">EUFY_USERNAME</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">EUFY_PASSWORD</code> are set in{' '}
            <code className="bg-gray-100 px-1 rounded">.env.local</code>.
          </p>
        </div>
      )}

      {!isLoading && !error && cameras.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-700 font-medium">No cameras found</p>
          <p className="text-yellow-600 text-sm mt-1">
            No camera devices were detected on your Eufy account.
          </p>
        </div>
      )}

      {!isLoading && !error && cameras.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <CameraPlayer key={camera.serialNumber} camera={camera} />
          ))}
        </div>
      )}
    </div>
  );
};
