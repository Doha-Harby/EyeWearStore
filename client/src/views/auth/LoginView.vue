<script setup>
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRoute, useRouter } from 'vue-router';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

// VeeValidate + Yup validate in the browser for instant feedback; the server validates again (never trust the client).
const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: yup.object({
    email: yup.string().email('Enter a valid email').required('Enter your email'),
    password: yup.string().required('Enter your password'),
  }),
});
const [email] = defineField('email');
const [password] = defineField('password');

const submit = handleSubmit(async (values) => {
  try {
    await auth.login(values);
    toast.success('Welcome back');
    router.push(route.query.redirect || '/');
  } catch (e) {
    toast.error(e.message);
  }
});
</script>

<template>
  <div class="container-page flex justify-center py-16 sm:py-24">
    <form class="w-full max-w-md space-y-6" novalidate @submit.prevent="submit">
      <div>
        <h1 class="text-5xl">Welcome back</h1>
        <p class="mt-2 text-sm text-stone-deep">Sign in to your LUMIÈRE account.</p>
      </div>
      <BaseInput
        v-model="email"
        label="Email"
        type="email"
        autocomplete="email"
        :error="errors.email"
      />
      <BaseInput
        v-model="password"
        label="Password"
        type="password"
        autocomplete="current-password"
        :error="errors.password"
      />
      <p class="text-right text-sm">
        <RouterLink to="/forgot-password" class="text-stone-deep underline underline-offset-4"
          >Forgot password?</RouterLink
        >
      </p>
      <BaseButton type="submit" class="w-full" :loading="isSubmitting">Sign in</BaseButton>
      <p class="text-sm text-stone-deep">
        New here?
        <RouterLink to="/register" class="text-charcoal underline underline-offset-4"
          >Create an account</RouterLink
        >
      </p>
    </form>
  </div>
</template>
