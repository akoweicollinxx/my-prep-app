// lib/vapi.ts
import Vapi from '@vapi-ai/web';

// Create the VAPI instance
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);

// Wrap the original stop method to handle Krisp unloading errors
const originalStop = vapi.stop;
vapi.stop = async function(): Promise<void> {
  try {
    await originalStop.call(this);
  } catch (error) {
    // Ignore "WASM_OR_WORKER_NOT_READY" errors when unloading Krisp processor
    if (error instanceof Error &&
        error.message &&
        error.message.includes('Error unloading krisp processor') &&
        error.message.includes('WASM_OR_WORKER_NOT_READY')) {
      console.warn('Suppressed Krisp unloading error:', error.message);
    } else {
      // Re-throw any other errors
      throw error;
    }
  }
};

export default vapi;
