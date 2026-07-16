# Firestore Security Specification

This document details the Zero-Trust security posture and Attribute-Based Access Control (ABAC) design for African Wise Warrior Safaris.

## 1. Data Invariants
1. **Admin Control over Catalogs**: Only authenticated admins (such as the predefined `Karimhemedi@yahoo.com`) can create, update, or delete packages (`/packages/{id}`) and news posts (`/news/{id}`).
2. **Read Access**: Anyone (even guest users) can read the packages collection and news collection.
3. **Verified Patrons**: Only authenticated users with an email-verified state can write comments (`/comments/{id}`).
4. **PII and Booking Safety**: Users can create booking requests (`/bookings/{id}`). Admins can read/delete bookings. Standard users can only read their own bookings.
5. **No Self-Assigned Privileges**: Normal users cannot modify global settings, change identities, or bypass validation structures.

---

## 2. The "Dirty Dozen" (Red-Team Threat Vectors)

1. **Package Sabotage**: A non-admin attempts to delete or alter a luxury safari package.
   - *Target*: `delete /packages/serengeti_luxury`
   - *Result*: `PERMISSION_DENIED`
2. **Fake Packages Injection**: An unauthorized user attempts to write a customized package with a negative price.
   - *Target*: `create /packages/fake_deal` with `{ price: -500 }`
   - *Result*: `PERMISSION_DENIED`
3. **Privilege Escalation**: A user attempts to label themselves as an admin or assign their profile to `admins` table.
   - *Target*: `create /admins/hacker_uid`
   - *Result*: `PERMISSION_DENIED`
4. **Spam Comments**: An unauthenticated guest tries to flood the feedback section with automated messages.
   - *Target*: `create /comments/spam`
   - *Result*: `PERMISSION_DENIED`
5. **Spoofed User Comments**: User A attempts to write a comment under User B's identifier (`userId`).
   - *Target*: `create /comments/troll` with `userId: "user_b"` while auth is `"user_a"`
   - *Result*: `PERMISSION_DENIED`
6. **Toxic Booking Modifications**: A random user attempts to edit another user's book request.
   - *Target*: `update /bookings/some_id`
   - *Result*: `PERMISSION_DENIED`
7. **Phantom News Posts**: A regular website visitor attempts to create a fake headline or edit a blog news post.
   - *Target*: `create /news/fake_news`
   - *Result*: `PERMISSION_DENIED`
8. **Negative Persons Booking**: An attacker creates a booking request specifying `-50` travelers.
   - *Target*: `create /bookings/bad_booking` with `people: -50`
   - *Result*: `PERMISSION_DENIED`
9. **Junk ID Poisoning**: Attacker sends a 50KB garbage string as a package ID to overflow database index space.
   - *Target*: `create /packages/...[50KB string]...`
   - *Result*: `PERMISSION_DENIED`
10. **Unchecked Modification (Shadow Updates)**: An admin package update action is sent but includes an unauthorized "Ghost Field" (e.g., adding `developerOverride: true`).
    - *Target*: `update /packages/id` with extra unapproved fields.
    - *Result*: `PERMISSION_DENIED` (handled by rules `affectedKeys().hasOnly(...)`)
11. **Malicious Delete Comment**: A normal user attempts to delete someone else's customer review/comment.
    - *Target*: `delete /comments/some_other_id`
    - *Result*: `PERMISSION_DENIED`
12. **Bypassing Verification**: A user whose email is not verified attempts to leave a comment.
    - *Target*: `create /comments/no_verify` while `auth.token.email_verified == false`
    - *Result*: `PERMISSION_DENIED`
