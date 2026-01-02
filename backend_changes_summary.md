# Backend Changes Summary - Resume Test Feature

This document outlines the changes made to the backend to support the "Resume Test" functionality.

## 1. Route Registrations
**File Name:** `app.js`  
**Full Path:** [server/src/app.js](file:///d:/Campus_technology/aipaathsala-main/server/src/app.js)

The following V2 routes were registered to handle advanced test submission and resume logic:

```javascript
// Test Submission Management Routes (V2 for Resume and Negative Marking)
app.post("/api/v2/starttestds2", testsubmissiondsctlr2.starttestds2);
app.post("/api/v2/submitanswerds2", testsubmissiondsctlr2.submitanswerds2);
app.post("/api/v2/submittestds2", testsubmissiondsctlr2.submittestds2);
app.post("/api/v2/allowresume", testsubmissiondsctlr2.allowresume);
app.get("/api/v2/getdisconnectedstudents", testsubmissiondsctlr2.getdisconnectedstudents);
app.get("/api/v2/getresumeeligibility", testsubmissiondsctlr2.getresumeeligibility);
```

## 2. Controller Modifications
**File Name:** `testsubmissiondsctlr2.js`  
**Full Path:** [server/src/controllers/testsubmissiondsctlr2.js](file:///d:/Campus_technology/aipaathsala-main/server/src/controllers/testsubmissiondsctlr2.js)

### `starttestds2`
- **Change:** Prioritized the `canResume` flag check. 
- **Impact:** Allows students to resume their test even if the current status is `submitted`, provided the faculty has granted manual "Allow Resume" permission.

### `submitanswerds2`
- **Change:** Added logic to save `selectedanswerkey` and update `lastQuestionAttempted`.
- **Impact:** Captures progress more granularly, allowing for exact restoration of selected options when a student returns.

### `allowresume`
- **Change:** Implemented/Verified logic to set `canResume: true` for a specific student submission in the database.

## 3. Model Updates
**File Name:** `testsubmissionds1.js`  
**Full Path:** [server/src/Models/testsubmissionds1.js](file:///d:/Campus_technology/aipaathsala-main/server/src/Models/testsubmissionds1.js)

- **Change:** Added `selectedanswerkey` (String) to the `answerschema`.
- **Impact:** Stores the letter of the selected option (e.g., 'a', 'b') separately from the answer text to facilitate UI restoration.
