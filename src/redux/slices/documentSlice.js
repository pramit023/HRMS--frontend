import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { documentApi } from '../../api/endpoints';

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await documentApi.getAll(params);
      return res?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const uploadDocumentThunk = createAsyncThunk(
  'documents/uploadDocument',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await documentApi.upload(formData);
      return res?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Upload failed');
    }
  }
);

export const verifyDocumentThunk = createAsyncThunk(
  'documents/verifyDocument',
  async ({ id, status, verificationNotes }, { rejectWithValue }) => {
    try {
      const res = await documentApi.verify(id, { status, verificationNotes });
      return res?.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Verification update failed');
    }
  }
);

export const deleteDocumentThunk = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentApi.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Delete failed');
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState: {
    items: [],
    loading: false,
    uploading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload Document
      .addCase(uploadDocumentThunk.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadDocumentThunk.fulfilled, (state, action) => {
        state.uploading = false;
        state.items.unshift(action.payload);
      })
      .addCase(uploadDocumentThunk.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Verify Document
      .addCase(verifyDocumentThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Document
      .addCase(deleteDocumentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((d) => d._id !== action.payload);
      });
  },
});

export default documentSlice.reducer;
