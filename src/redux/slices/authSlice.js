import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/endpoints';

const initialUser = (() => {
  try {
    const saved = localStorage.getItem('hrms_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authApi.login({ email, password });
      if (res?.data) {
        const { user, accessToken, refreshToken, mustChangePassword } = res.data;
        localStorage.setItem('hrms_token', accessToken);
        localStorage.setItem('hrms_refresh_token', refreshToken);
        localStorage.setItem('hrms_user', JSON.stringify(user));
        return { user, accessToken, refreshToken, mustChangePassword };
      }
      return rejectWithValue('No user data returned');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const forceChangePasswordThunk = createAsyncThunk(
  'auth/forceChangePassword',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await authApi.forceChangePassword(payload);
      if (res?.data) {
        const { user, accessToken, refreshToken } = res.data;
        localStorage.setItem('hrms_token', accessToken);
        localStorage.setItem('hrms_refresh_token', refreshToken);
        localStorage.setItem('hrms_user', JSON.stringify(user));
        return { user, accessToken, refreshToken };
      }
      return rejectWithValue('Could not change password');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Password change failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await authApi.logout();
  } catch (e) {
    // ignore
  } finally {
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_refresh_token');
    localStorage.removeItem('hrms_user');
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: localStorage.getItem('hrms_token') || null,
    loading: false,
    error: null,
    mustChangePassword: initialUser?.mustChangePassword || false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.mustChangePassword = action.payload?.mustChangePassword || false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.mustChangePassword = action.payload.mustChangePassword;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Force Change Password
      .addCase(forceChangePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceChangePasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.mustChangePassword = false;
      })
      .addCase(forceChangePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.mustChangePassword = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
