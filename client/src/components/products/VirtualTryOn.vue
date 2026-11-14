<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue';
import { Camera, CameraOff } from 'lucide-vue-next';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({ productName: { type: String, default: '' } });
const video = ref(null);
const state = ref('idle'); // idle | starting | live | denied | unsupported
let stream = null;

async function start() {
  if (!navigator.mediaDevices?.getUserMedia) return (state.value = 'unsupported');
  state.value = 'starting';
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    state.value = 'live';
    await nextTick();
    video.value.srcObject = stream;
    // INTEGRATION POINT: pass `video.value` to a face-landmark model (e.g. MediaPipe Face Landmarker)
    // and draw the frame image over the eyes. Everything else (permission, preview, cleanup) is done.
  } catch {
    state.value = 'denied';
  }
}
function stop() {
  stream?.getTracks().forEach((t) => t.stop()); // turns the camera light off
  stream = null;
  state.value = 'idle';
}
onBeforeUnmount(stop);
</script>

<template>
  <section class="bg-ivory p-6 sm:p-10" aria-labelledby="tryon-h">
    <div class="grid items-center gap-8 md:grid-cols-2">
      <div>
        <p class="eyebrow">VIRTUAL TRY-ON</p>
        <h2 id="tryon-h" class="mt-3 text-4xl">See {{ productName || 'these frames' }} on you</h2>
        <p class="mt-3 text-sm text-stone-deep">
          Turn on your camera to preview your face. The frame overlay is coming soon. Your video
          stays in your browser and is never uploaded.
        </p>
        <div class="mt-6">
          <BaseButton v-if="state !== 'live'" :loading="state === 'starting'" @click="start"
            ><Camera class="h-4 w-4" aria-hidden="true" />Start camera</BaseButton
          ><BaseButton v-else variant="secondary" @click="stop"
            ><CameraOff class="h-4 w-4" aria-hidden="true" />Stop camera</BaseButton
          >
        </div>
        <p v-if="state === 'denied'" class="mt-3 text-sm text-red-700" role="alert">
          Camera access was blocked. Allow it in your browser settings and try again.
        </p>
        <p v-if="state === 'unsupported'" class="mt-3 text-sm text-red-700" role="alert">
          Your browser does not support camera access.
        </p>
      </div>
      <div class="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden bg-charcoal">
        <video
          v-if="state === 'live'"
          ref="video"
          autoplay
          playsinline
          muted
          class="h-full w-full -scale-x-100 object-cover"
        />
        <div v-else class="flex h-full items-center justify-center text-stone">
          <Camera class="h-10 w-10" aria-hidden="true" />
        </div>
        <svg
          v-if="state === 'live'"
          viewBox="0 0 100 75"
          class="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <ellipse
            cx="50"
            cy="37"
            rx="19"
            ry="26"
            fill="none"
            stroke="#C6A76B"
            stroke-width="0.6"
            stroke-dasharray="2 2"
          />
        </svg>
      </div>
    </div>
  </section>
</template>
