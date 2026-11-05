'use client';

import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  /** Ditampilkan jika komponen anak gagal render (crash). */
  fallback: React.ReactNode;
  /** Label untuk pesan di console — membantu debugging. */
  name?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * React Error Boundary — menangkap runtime error di subtree anak
 * sehingga satu komponen crash (misal: WebGL tidak tersedia di
 * Lanyard3D) tidak membuat seluruh halaman blank.
 *
 * Catatan: Error Boundary adalah class component — React tidak
 * menyediakan hook fungsi untuk ini.
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ''}]`,
      error,
      info.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
