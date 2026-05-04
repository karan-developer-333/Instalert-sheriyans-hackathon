import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as apiKeyService from '../../services/apiKey.service.js';

export const generateKey = createAsyncThunk(
  'apiKey/generate',
  async (_, { rejectWithValue }) => {
    try {
      return await apiKeyService.generateApiKey();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate key');
    }
  }
);

export const getKey = createAsyncThunk(
  'apiKey/get',
  async (_, { rejectWithValue }) => {
    try {
      return await apiKeyService.getApiKey();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to get key');
    }
  }
);

export const revokeKey = createAsyncThunk(
  'apiKey/revoke',
  async (_, { rejectWithValue }) => {
    try {
      await apiKeyService.revokeApiKey();
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to revoke key');
    }
  }
);

const apiKeySlice = createSlice({
  name: 'apiKey',
  initialState: { key: null, loading: false, error: null, newKey: null },
  reducers: {
    clearNewKey: (state) => { state.newKey = null; },
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateKey.pending, (state) => { state.loading = true; })
      .addCase(generateKey.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.apiKey) {
          state.newKey = action.payload;
          state.key = { preview: `ik_live_${'*'.repeat(28)}${action.payload.apiKey.slice(-4)}`, generatedAt: new Date() };
        }
      })
      .addCase(generateKey.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(getKey.fulfilled, (state, action) => { state.key = action.payload || null; })
      .addCase(revokeKey.fulfilled, (state) => {
        state.key = null;
        state.newKey = null;
      });
  }
});

export const { clearNewKey, clearError } = apiKeySlice.actions;
export default apiKeySlice.reducer;
