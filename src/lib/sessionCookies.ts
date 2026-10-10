/**
 * Helper utility to synchronize Auth & Guest session state across localStorage and document.cookie.
 * Ensures seamless token persistence and session continuity across page reloads & browser tabs.
 */

export const sessionCookieManager = {
  setCookie(name: string, value: string, days = 7) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  },

  getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const matches = document.cookie.match(
      new RegExp('(?:^|; )' + encodeURIComponent(name).replace(/[\-\.\+\*]/g, '\\$&') + '=([^;]*)')
    );
    return matches ? decodeURIComponent(matches[1]) : null;
  },

  removeCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  },

  syncAuthSession(accessToken?: string | null, refreshToken?: string | null) {
    if (accessToken) {
      this.setCookie('aptiquiz_access_token', accessToken, 7);
      localStorage.setItem('aptiquiz_access_token', accessToken);
    } else {
      this.removeCookie('aptiquiz_access_token');
      localStorage.removeItem('aptiquiz_access_token');
    }

    if (refreshToken) {
      this.setCookie('aptiquiz_refresh_token', refreshToken, 30);
      localStorage.setItem('aptiquiz_refresh_token', refreshToken);
    } else {
      this.removeCookie('aptiquiz_refresh_token');
      localStorage.removeItem('aptiquiz_refresh_token');
    }
  },

  syncGuestSession(guestToken?: string | null, guestName?: string | null) {
    if (guestToken && guestName) {
      this.setCookie('aptiquiz_guest_token', guestToken, 7);
      this.setCookie('aptiquiz_guest_name', guestName, 7);
      localStorage.setItem('aptiquiz_guest_token', guestToken);
      localStorage.setItem('aptiquiz_guest_name', guestName);
    } else {
      this.removeCookie('aptiquiz_guest_token');
      this.removeCookie('aptiquiz_guest_name');
      localStorage.removeItem('aptiquiz_guest_token');
      localStorage.removeItem('aptiquiz_guest_name');
    }
  },

  getGuestSession(): { guestToken: string | null; guestName: string | null } {
    const token = this.getCookie('aptiquiz_guest_token') || localStorage.getItem('aptiquiz_guest_token');
    const name = this.getCookie('aptiquiz_guest_name') || localStorage.getItem('aptiquiz_guest_name');
    return { guestToken: token, guestName: name };
  },

  clearAllSessions() {
    this.removeCookie('aptiquiz_access_token');
    this.removeCookie('aptiquiz_refresh_token');
    this.removeCookie('aptiquiz_guest_token');
    this.removeCookie('aptiquiz_guest_name');
    localStorage.removeItem('aptiquiz_access_token');
    localStorage.removeItem('aptiquiz_refresh_token');
    localStorage.removeItem('aptiquiz_guest_token');
    localStorage.removeItem('aptiquiz_guest_name');
  },
};
