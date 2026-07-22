"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createDriverSchoolRegistration } from "@/services/driver-school-registration.api";

type RegisterFormState = {
  name: string;
  number: string;
  schoolName: string;
  schoolAddress: string;
};

const initialForm: RegisterFormState = {
  name: "",
  number: "",
  schoolName: "",
  schoolAddress: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormState>(initialForm);

  const registerMutation = useMutation({
    mutationKey: ["createDriverSchoolRegistration"],
    mutationFn: async (payload: RegisterFormState) => {
      const response = await createDriverSchoolRegistration(payload);
      if (!response.status) {
        throw new Error(response.message || "Could not submit registration");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("School registration submitted successfully");
      setForm(initialForm);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onChange = (
    key: keyof RegisterFormState,
    value: RegisterFormState[keyof RegisterFormState],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!/^\d{10}$/.test(form.number.trim())) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!form.schoolName.trim()) {
      toast.error("Please enter school name");
      return;
    }

    if (form.schoolAddress.trim().length < 10) {
      toast.error("School address must be at least 10 characters");
      return;
    }

    registerMutation.mutate({
      name: form.name.trim(),
      number: form.number.trim(),
      schoolName: form.schoolName.trim(),
      schoolAddress: form.schoolAddress.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-2">
          <section className="flex flex-col justify-center rounded-3xl border border-blue-100 bg-white/70 p-8 shadow-xl backdrop-blur-sm sm:p-10">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <span className="text-lg font-bold text-white">iD</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Register Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Driving School
              </span>
            </h1>

            <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">
              Join iDrive and start managing bookings, instructors, and students
              from one platform. Fill this quick form and our team will contact
              you.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-2xl font-bold text-blue-700">500+</p>
                <p className="text-sm text-blue-900/80">Schools using iDrive</p>
              </div>
              <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
                <p className="text-2xl font-bold text-purple-700">24/7</p>
                <p className="text-sm text-purple-900/80">Support assistance</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Back to Home
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
              >
                Go to Login
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-white/40 bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4 text-white">
              <h2 className="text-xl font-semibold">School Registration Form</h2>
              <p className="mt-1 text-sm text-blue-100">
                Basic details required to create your registration.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  maxLength={80}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="number"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Mobile Number
                </label>
                <input
                  id="number"
                  type="tel"
                  value={form.number}
                  onChange={(e) => onChange("number", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="schoolName"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  School Name
                </label>
                <input
                  id="schoolName"
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => onChange("schoolName", e.target.value)}
                  placeholder="Enter school name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="schoolAddress"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  School Address
                </label>
                <textarea
                  id="schoolAddress"
                  value={form.schoolAddress}
                  onChange={(e) => onChange("schoolAddress", e.target.value)}
                  placeholder="Enter full school address"
                  className="min-h-28 w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  maxLength={400}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3.5 font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Submit Registration"
                )}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
