<script setup>
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useRouter } from 'vue-router';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const { defineField, handleSubmit, errors, setErrors, isSubmitting } = useForm({
  validationSchema: yup.object({
    name: yup.string().trim().min(2, 'Enter your name').required('Enter your name'),
    email: yup.string().email('Enter a valid email').required('Enter your email'),
    password: yup.string().min(8, 'Use at least 8 characters').required('Choose a password'),
    confirm: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords do not match')
      .required('Confirm your password'),
  }),
});
const [name] = defineField('name');
const [email] = defineField('email');
const [password] = defineField('password');
const [confirm] = defineField('confirm');

const submit = handleSubmit(async ({ name, email, password }) => {
  try {
    await auth.register({ name, email, password });
    toast.success('Account created. Check your inbox to verify your email.');
    router.push('/');
  } catch (e) {
    setErrors(e.errors); // show server-side field errors (e.g. email taken) under the right input
    toast.error(e.message);
  }
});
</script>

<template>
  <div class="container-page flex justify-center py-16 sm:py-24">
    <form class="w-full max-w-md space-y-6" novalidate @submit.prevent="submit">
      <div>
        <h1 class="text-5xl">Create your account</h1>
        <p class="mt-2 text-sm text-stone-deep">
          Save favourites, track orders and check out faster.
        </p>
      </div>
      <BaseInput v-model="name" label="Full name" autocomplete="name" :error="errors.name" />
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
        autocomplete="new-password"
        hint="At least 8 characters"
        :error="errors.password"
      />
      <BaseInput
        v-model="confirm"
        label="Confirm password"
        type="password"
        autocomplete="new-password"
        :error="errors.confirm"
      />
      <BaseButton type="submit" class="w-full" :loading="isSubmitting">Create account</BaseButton>
      <p class="text-sm text-stone-deep">
        Already registered?
        <RouterLink to="/login" class="text-charcoal underline underline-offset-4"
          >Sign in</RouterLink
        >
      </p>
    </form>
  </div>
</template>
