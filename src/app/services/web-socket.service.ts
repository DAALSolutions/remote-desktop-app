import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {WS_URL} from "../constants/constants";

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  public wsRemoteDesktopFrameReceived: Subject<string> = new Subject();
  public framesPerSecond$: Subject<string> = new Subject();
  public connectionDied$: Subject<void> = new Subject();
  private videoBuffer: Uint8Array = new Uint8Array();
  private previousTimestamp: number;

  private uint8ArrayToBase64(uint8Array: Uint8Array): string {
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }

    return btoa(binary);
  }

  private concatenateUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);

    return result;
  }

  private async processBinaryFrame(chunk: Uint8Array): Promise<void> {
    this.videoBuffer = this.concatenateUint8Arrays(this.videoBuffer, chunk);

    // Check for end of JPEG frame
    const isEndOfFrame = chunk.length < 2 ||
      (chunk[chunk.byteLength - 2] === 255 && chunk[chunk.byteLength - 1] === 217);

    if (isEndOfFrame) {
      this.calculateFramesPerSecond();

      const base64String: string =
        'data:image/jpeg;base64,' + this.uint8ArrayToBase64(this.videoBuffer);
      this.videoBuffer = new Uint8Array(); // Clear the buffer
      this.wsRemoteDesktopFrameReceived.next(base64String);
    }
  }

  public connectWithWebsocket(machineId: string): WebSocket {
    const socket = new WebSocket(`${WS_URL}/?machineId=${machineId}`); // UUID/GUID is URL safe. ref https://stackoverflow.com/a/23146255
    socket.binaryType = 'arraybuffer';
    this.videoBuffer = new Uint8Array(); // Clear the buffer
    socket.onopen = () => {
      console.log('[open] Connection established');
    };

    socket.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        const chunk: Uint8Array = new Uint8Array(event.data);

        // Use await to handle the completion
        await this.processBinaryFrame(chunk);
      } else {
        // text frame
        // const json = JSON.parse(event.data);
      }
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(
          `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.log('[close] Connection died');
        this.connectionDied$.next();
      }
    };

    socket.onerror = (error) => {
      console.error('[error]', error);
    };

    return socket;
  }

  private calculateFramesPerSecond() {
    const currentTimestamp = Date.now();

    if (this.previousTimestamp) {
      const timeDifference = currentTimestamp - this.previousTimestamp;
      const currentFPS = 1000 / timeDifference;
      this.framesPerSecond$.next(currentFPS.toFixed(2));
    }

    this.previousTimestamp = currentTimestamp;
  }
}
