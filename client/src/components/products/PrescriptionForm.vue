<script setup>
import { reactive, ref, watch } from 'vue';

// v-model value: { enabled, valid, data }. The parent blocks "Add to cart" while enabled && !valid.
defineProps({ modelValue: { type: Object, default: null } });
const emit = defineEmits(['update:modelValue']);

const enabled = ref(false);
const f = reactive({
  type: 'single-vision',
  coating: 'none',
  od: { sph: '', cyl: '', axis: '' },
  os: { sph: '', cyl: '', axis: '' },
  pd: '',
  note: '',
});
const num = (v) => (v === '' || v == null ? undefined : Number(v));
const eye = (e) => ({ sph: num(e.sph), cyl: num(e.cyl) ?? 0, axis: num(e.axis) });
// An eye is complete when it has a sphere value, and an axis whenever there is a cylinder value.
const eyeOk = (e) => e.sph !== undefined && (e.cyl === 0 || e.axis !== undefined);

watch(
  [enabled, f],
  () => {
    const data = {
      type: f.type,
      coating: f.coating,
      od: eye(f.od),
      os: eye(f.os),
      pd: num(f.pd),
      note: f.note.trim() || undefined,
    };
    emit('update:modelValue', {
      enabled: enabled.value,
      valid: !enabled.value || (eyeOk(data.od) && eyeOk(data.os)),
      data: enabled.value ? data : null,
    });
  },
  { deep: true },
);

const TYPES = [
  ['single-vision', 'Single vision'],
  ['progressive', 'Progressive'],
  ['reading', 'Reading'],
];
const COATINGS = [
  ['none', 'No coating'],
  ['anti-reflective', 'Anti-reflective'],
  ['blue-light', 'Blue-light filter'],
  ['photochromic', 'Photochromic (darkens in sun)'],
];
</script>

<template>
  <fieldset class="border border-stone/30 p-5">
    <legend class="px-2 text-sm font-medium">Prescription lenses</legend>
    <label class="flex items-center gap-2 text-sm"
      ><input v-model="enabled" type="checkbox" /> Add my prescription</label
    >
    <div v-if="enabled" class="mt-5 space-y-5 text-sm">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="rx-type" class="mb-2 block">Lens type</label
          ><select id="rx-type" v-model="f.type" class="field">
            <option v-for="[v, l] in TYPES" :key="v" :value="v">{{ l }}</option>
          </select>
        </div>
        <div>
          <label for="rx-coat" class="mb-2 block">Lens coating</label
          ><select id="rx-coat" v-model="f.coating" class="field">
            <option v-for="[v, l] in COATINGS" :key="v" :value="v">{{ l }}</option>
          </select>
        </div>
      </div>
      <div
        v-for="[k, label] in [
          ['od', 'Right eye (OD)'],
          ['os', 'Left eye (OS)'],
        ]"
        :key="k"
      >
        <p class="mb-2 font-medium">{{ label }}</p>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label :for="`rx-${k}-s`" class="mb-1 block text-xs text-stone-deep">Sphere (SPH)</label
            ><input
              :id="`rx-${k}-s`"
              v-model="f[k].sph"
              type="number"
              step="0.25"
              min="-20"
              max="20"
              class="field h-10"
            />
          </div>
          <div>
            <label :for="`rx-${k}-c`" class="mb-1 block text-xs text-stone-deep"
              >Cylinder (CYL)</label
            ><input
              :id="`rx-${k}-c`"
              v-model="f[k].cyl"
              type="number"
              step="0.25"
              min="-10"
              max="10"
              class="field h-10"
            />
          </div>
          <div>
            <label :for="`rx-${k}-a`" class="mb-1 block text-xs text-stone-deep">Axis</label
            ><input
              :id="`rx-${k}-a`"
              v-model="f[k].axis"
              type="number"
              step="1"
              min="0"
              max="180"
              class="field h-10"
            />
          </div>
        </div>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="rx-pd" class="mb-2 block">Pupillary distance (mm, optional)</label
          ><input id="rx-pd" v-model="f.pd" type="number" min="40" max="80" class="field" />
        </div>
        <div>
          <label for="rx-note" class="mb-2 block">Note (optional)</label
          ><input id="rx-note" v-model="f.note" maxlength="300" class="field" />
        </div>
      </div>
      <p class="text-xs text-stone-deep">
        Enter sphere for both eyes. Add an axis whenever you enter a cylinder value. Lens options
        are recorded with your order.
      </p>
    </div>
  </fieldset>
</template>
