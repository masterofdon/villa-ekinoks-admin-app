/**
 * Server-Sent Events service for real-time upload progress tracking
 */

import { UploadProgressEvent, UploadProgressStage } from '../types';

export type UploadProgressListener = (event: UploadProgressEvent) => void;

export class UploadProgressSSE {
  private abortController: AbortController | null = null;
  private readonly listeners: Set<UploadProgressListener> = new Set();
  private readonly uploadId: string;
  private connected = false;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  constructor(uploadId: string) {
    this.uploadId = uploadId;
  }

  /**
   * Start listening to upload progress events using fetch with streaming
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const connectAsync = async () => {
        if (this.connected) {
          resolve();
          return;
        }

        try {
          this.abortController = new AbortController();
          
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.villaekinoks.com/api/v1';
          const sseUrl = `${baseUrl}/property-galleries/upload-progress/${this.uploadId}`;
          
          // Get auth token for Authorization header
          const token = globalThis.window ? localStorage.getItem('accesstoken') : null;
          const headers: Record<string, string> = {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
          };
          
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          const response = await fetch(sseUrl, {
            headers,
            signal: this.abortController.signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          if (!response.body) {
            throw new Error('Response body is null');
          }

          this.connected = true;
          resolve();

          // Process the stream
          this.reader = response.body.getReader();
          this.processStream();
          
        } catch (error) {
          console.error('SSE connection error:', error);
          this.connected = false;
          reject(new Error('SSE connection failed: ' + (error instanceof Error ? error.message : 'Unknown error')));
        }
      };
      
      connectAsync();
    });
  }

  private async processStream(): Promise<void> {
    if (!this.reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          console.log('SSE raw line:', line);

          if (line.startsWith('data:')) {
            // Standard SSE format: data: {JSON}
            try {
              const data = line.substring(5); // Remove 'data:' prefix
              console.log('SSE data extracted:', data);
              
              if (data.trim()) {
                
                const progressData = JSON.parse(data) as UploadProgressEvent;
                console.log('SSE progress data parsed:', progressData);
                
                this.notifyListeners(progressData);
                
                // Auto-close on completion or error
                if (progressData.stage === 'complete' || progressData.stage === 'error') {
                  console.log('SSE auto-closing due to stage:', progressData.stage);
                  setTimeout(() => this.disconnect(), 1000);
                  return;
                }
              }
            } catch (error) {
              console.error('Failed to parse SSE message:', error, 'Raw data:', line);
            }
          } else if (line.includes('\t')) {
            
            // Custom format: eventType\t{JSON}
            try {
              const [eventType, jsonData] = line.split('\t', 2);
              console.log(`SSE custom format - Event: ${eventType}, Data: ${jsonData}`);
              
              if (jsonData?.trim()) {
                const progressData = JSON.parse(jsonData) as UploadProgressEvent;
                console.log('SSE progress data parsed:', progressData);
                
                this.notifyListeners(progressData);
                
                // Auto-close on completion or error
                if (eventType === 'complete' || progressData.stage === 'complete' || progressData.stage === 'error') {
                  console.log('SSE auto-closing due to event type or stage:', eventType, progressData.stage);
                  setTimeout(() => this.disconnect(), 1000);
                  return;
                }
              }
            } catch (error) {
              console.error('Failed to parse SSE custom format message:', error, 'Raw data:', line);
            }
          } else if (line.trim()) {
            console.log('SSE non-data line:', line);
          }
        }
      }
    } catch (error) {
      if (this.abortController?.signal.aborted) {
        // Connection was intentionally closed
        return;
      }
      console.error('Stream processing error:', error);
      this.connected = false;
    }
  }

  /**
   * Add a listener for progress events
   */
  addListener(listener: UploadProgressListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(listener: UploadProgressListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.reader) {
      this.reader.cancel();
      this.reader = null;
    }
    this.connected = false;
    this.listeners.clear();
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !this.abortController?.signal.aborted;
  }

  /**
   * Get the upload ID
   */
  getUploadId(): string {
    return this.uploadId;
  }

  private notifyListeners(event: UploadProgressEvent): void {
    console.log(`SSE notifyListeners called with event:`, event);
    console.log(`Number of listeners: ${this.listeners.size}`);
    
    let listenerCount = 0;
    this.listeners.forEach(listener => {
      try {
        listenerCount++;
        console.log(`Calling listener ${listenerCount} with event:`, event);
        listener(event);
      } catch (error) {
        console.error(`Error in progress listener ${listenerCount}:`, error);
      }
    });
  }
}

/**
 * Utility function to create and manage SSE connection for an upload
 */
export const createUploadProgressSSE = (uploadId: string): UploadProgressSSE => {
  return new UploadProgressSSE(uploadId);
};

/**
 * Get user-friendly stage messages
 */
export const getStageMessage = (stage: UploadProgressStage): string => {
  const stageMessages: Record<UploadProgressStage, string> = {
    'started': 'Upload started...',
    'validating': 'Validating gallery...',
    'preparing': 'Preparing file...',
    'uploading-original': 'Uploading original image...',
    'uploading-preview': 'Creating preview image...',
    'uploading-resized': 'Creating resized image...',
    'creating-records': 'Saving to database...',
    'finalizing': 'Finalizing upload...',
    'complete': 'Upload complete!',
    'error': 'Upload failed',
  };
  
  return stageMessages[stage] || 'Processing...';
};

/**
 * Generate a unique upload ID for tracking
 */
export const generateUploadId = (): string => {
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};