
const testdsctlr2 = require("./controllers/testdsctlr2.js");
const testsubmissiondsctlr2 = require("./controllers/testsubmissiondsctlr2.js");
const questionmanagementctlr = require("./controllers/questionmanagementctlr.js");

// Test Submission Management Routes (V2 for Resume and Negative Marking)
app.post("/api/v2/starttestds2", testsubmissiondsctlr2.starttestds2);
app.post("/api/v2/submitanswerds2", testsubmissiondsctlr2.submitanswerds2);
app.post("/api/v2/submittestds2", testsubmissiondsctlr2.submittestds2);
app.post("/api/v2/allowresume", testsubmissiondsctlr2.allowresume);
app.get("/api/v2/getdisconnectedstudents", testsubmissiondsctlr2.getdisconnectedstudents);
app.get("/api/v2/getresumeeligibility", testsubmissiondsctlr2.getresumeeligibility);

// Test Submission Management Routes (Updated)
app.post("/api/v2/createtestsubmissionds1", testsubmissiondsctlr1.createtestsubmissionds1);
app.get("/api/v2/gettestsubmissionsbyuser1", testsubmissiondsctlr1.gettestsubmissionsbyuser1);
app.get("/api/v2/gettestsubmissionsbytest1", testsubmissiondsctlr1.gettestsubmissionsbytest1);
app.post("/api/v2/starttestds1", testsubmissiondsctlr1.starttestds1);
app.post("/api/v2/submitanswerds1", testsubmissiondsctlr1.submitanswerds1);
app.post("/api/v2/submittestds1", testsubmissiondsctlr1.submittestds1);
app.post("/api/v2/getstudentattemptscount", testsubmissiondsctlr1.getstudentattemptscount);

// Enhanced Test Management Routes (V2)
app.post("/api/v2/createtestds2", testdsctlr2.createtestds2);
app.post("/api/v2/updatetestds2", testdsctlr2.updatetestds2);
app.get("/api/v2/gettestds2", testdsctlr2.gettestds2);
app.post("/api/v2/allowstudentretake2", testdsctlr2.allowstudentretake2);

// Enhanced Submission Management (V2)
app.post("/api/v2/starttestds2", testsubmissiondsctlr2.starttestds2);
app.post("/api/v2/submitanswerds2", testsubmissiondsctlr2.submitanswerds2);
app.post("/api/v2/submittestds2", testsubmissiondsctlr2.submittestds2);
app.get("/api/v2/getresumeeligibility", testsubmissiondsctlr2.getresumeeligibility);
app.post("/api/v2/allowresume", testsubmissiondsctlr2.allowresume);
app.get("/api/v2/getdisconnectedstudents", testsubmissiondsctlr2.getdisconnectedstudents);

// Bulk Question Management
app.post("/api/v2/bulkuploadquestions", questionmanagementctlr.bulkUploadQuestions);