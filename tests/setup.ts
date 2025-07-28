///<reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Cleanup after each test case
afterEach(() => {
  cleanup()
})