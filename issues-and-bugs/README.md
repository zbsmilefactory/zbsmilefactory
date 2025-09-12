# Feature status — clear & structured

Below is a cleaned-up, structured version of your progress + remaining issues. I grouped by feature, gave a short status, what's done, what's failing, and recommended next steps with priorities.

---

# 1. Auth service (email + OTP)

**Status:** Partially complete

**What's done**

* UI implemented for login with email + OTP flow.

**Remaining / not working**

* Email OTP not being sent from the correct domain.
* OTP validation: random/invalid OTPs are currently accepted.
* Dual/ambiguous flow: password + email form exists but the system still requires email + OTP (confusing).
* Sign-in / sign-up screens are accessible even when a user is already logged in.
* UX: generic error messages that don't explain failures.

**Bugs**

* OTP acceptance logic accepts invalid codes.
* Email sending uses wrong domain (deliverability / reputation risk).
* Authentication UI allows inconsistent states (logged-in users can open auth screens).

**Recommended next steps (priority)**

1. **High:** Fix OTP validation logic so only correct OTPs are accepted.
2. **High:** Correct email-sending configuration so OTPs come from the correct domain.
3. **Medium:** Remove/guard sign-in & sign-up pages for authenticated users.
4. **Medium:** Simplify flow: remove password field from OTP-first flows or clearly separate flows (password-based vs OTP-based).
5. **Low:** Improve error messages to be actionable (e.g., "OTP expired", "Invalid email", "Email delivery failed").

---

# 2. Profile creation & CRUD

**Status:** Complete

**What's done**

* Users can create and edit all profile types.

**Remaining / not working**

* Profile interactions (follow, private messaging) are not fully implemented.

**Bugs**

* Follow/unfollow actions not functioning.
* Follow counts not updating.
* Private messaging not yet available.

**Recommended next steps (priority)**

1. **High:** Implement follow/unfollow endpoints and ensure counts update atomically.
2. **High:** Implement private messaging backend and inbox UI.
3. **Medium:** Add notifications for new followers / messages.

---

# 3. Posts (CRUD & custom post types)

**Status:** Work in progress — post creation mostly complete; interactions incomplete

**What's done**

* Post creation UI exists (various post types supported): opportunity, event, article, generic, marketplace.
* Each custom type has a CTA; there are common actions (like, bookmark, share, comment) and a dropdown with actions (report, copy link, unfollow).

**Remaining / not working**

* Image upload in post creation not fully functional.
* Post edit and post delete are not implemented.
* Like counts not updating (likes may register visually but count is stale).
* Bookmark functionality uses sample data only; bookmarking backend not implemented.
* Comments not working.
* Share not working.
* Custom CTA flows:

  * Marketplace: "contact seller" not working; no dashboard follow-up/messages.
  * Event: registration flow not implemented; no registered-events area in user dashboard.

**Bugs**

* Dynamic post form retains previous error messages when switching post types — form state not cleared.
* Post types switching causes stale validation/messages to persist.

**Recommended next steps (priority)**

1. **High:** Fix image upload pipeline and integrate storage (S3 / equivalent) + validations.
2. **High:** Implement post edit & delete endpoints + UI.
3. **High:** Implement backend for likes/bookmarks/comments and ensure counts update in real time or on refresh.
4. **Medium:** Build marketplace contact flow and link messages to user dashboard.
5. **Medium:** Implement event registration flow and "registered events" in the profile dashboard.
6. **Medium:** Fix form state clearing when switching post types.

**Useful links**

* Post area (testing): [https://test.smilefactory.co.zw/home](https://test.smilefactory.co.zw/home)

---

# 4. Profile interactions, search & feeds

**Status:** Work in progress

**What's done**

* Basic UI for discover/search and feeds exists.

**Remaining / not working**

* Search is incomplete (discover page work-in-progress). — [https://test.smilefactory.co.zw/home/discover](https://test.smilefactory.co.zw/home/discover)
* Connection / follow flows are incomplete.
* Custom feeds (personalized feeds) are incomplete.

**Recommended next steps (priority)**

1. **High:** Complete follow/connect backend to enable social graph operations.
2. **High:** Wire personalized feed algorithm to follow graph and post visibility rules.
3. **Medium:** Finalize search indexing & filters (tags, post type, people, organizations).

---

# 5. Notifications

**Status:** Not working (demo data only)

**What's done**

* Notification UI with demo data exists.

**Remaining / not working**

* Real notifications (follow, message, like, comment, event registration) not yet implemented.

**Recommended next steps (priority)**

1. **High:** Implement notification events for follower, message, like, comment, and registration.
2. **Medium:** Create real-time delivery mechanism (WebSocket / push) and a notification center in profile dashboard.

---

# 6. Cross-cutting bugs / UX items

**Key issues**

* Generic error messages across flows.
* Auth screens accessible while logged in.
* Form state not cleared on dynamic type changes.
* Wrong email-sending domain (auth).
* Several features use demo/sample data (bookmarks, notifications).

**Recommended fixes (priority)**

1. **High:** Improve error messages and add validation feedback.
2. **High:** Ensure environment configs (email domain, storage endpoints) are correct across staging.
3. **Medium:** Audit routes to hide auth screens when authenticated.
4. **Medium:** Replace demo data with real API-backed data for bookmarks/notifications.

---

# Quick implementation plan (minimal, actionable)

1. **Blocker fixes (today–this sprint)**

   * OTP validation and email domain fix.
   * Fix form state clearing in dynamic post form.
   * Implement follow/unfollow endpoints.

2. **Core social features (next sprint)**

   * Messaging backend + UI.
   * Post edit/delete, image upload pipeline.
   * Likes/bookmarks/comments backend + counts.

3. **Polish & UX (following sprint)**

   * Event registration + registered-events dashboard.
   * Marketplace contact flow + dashboard messages.
   * Notifications (real events + real-time).

---

# Issue Tracking Guidelines

## Creating New Issues

When you discover a new bug or issue:

1. **Check existing issues** in this folder first
2. **Create JIRA ticket** with SMILE-XXX format
3. **Document the issue** with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Environment details (browser, device, etc.)

## Priority Levels

- **High**: Blocks core functionality or user experience
- **Medium**: Affects secondary features or causes minor UX issues
- **Low**: Cosmetic issues or nice-to-have improvements

## Status Tracking

- **Open**: Issue identified and needs work
- **In Progress**: Someone is actively working on it
- **Testing**: Fix implemented, needs verification
- **Closed**: Issue resolved and verified

## Testing Environment

- **Live Test Site**: https://test.smilefactory.co.zw/home
- **Admin Access**: [Contact admin for credentials]
- **API Endpoints**: [Document API base URL]

## Reporting Template

```markdown
## Issue Title
Brief description of the issue

### Environment
- Browser: [Chrome/Firefox/Safari/Edge]
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/Mac/Linux/iOS/Android]
- URL: [Specific page where issue occurs]

### Steps to Reproduce
1. Step one
2. Step two
3. Step three

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots/Videos
[Attach relevant media]

### Additional Notes
Any other relevant information
```
