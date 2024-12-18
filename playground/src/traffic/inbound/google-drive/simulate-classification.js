import { defineTraffic } from "motia";

export default defineTraffic({
  path: "/api/simulateClassification",
  method: "POST",
  transform: async (req) => {
    const { testDocContent } = req.body;
    if (!testDocContent) {
      throw new Error("testDocContent is required");
    }

    // We simulate that the rules have been fetched and content is ready for classification.
    // Emitting `doc.ready_for_classification` bypasses steps you'd normally hit, but it's useful for testing.
    return {
      type: "doc.ready_for_classification",
      data: {
        originalFileId: "TEST_DOC_ID",
        originalDocContent: testDocContent,
        docContent: `
Organization Policy Rules - Q4 Update
General Compliance:
All policy documents must not conflict with existing corporate policies.
All financial limits mentioned must be within the approved budget levels set forth by the Finance Department.
Any mention of new categories of expenses or changes in approval processes require explicit reference to existing policies or must be explicitly flagged for human review.
Expense & Approval Rules:
Any increase in reimbursement thresholds above $500 requires human review and approval before finalization.
Introducing new expense categories (like “Executive Travel” or “Personal Subscriptions”) must be escalated for legal and managerial review.
Language suggesting that employees are not required to keep receipts for expenses is prohibited and triggers human approval.
Compliance & Legal Requirements:
Any policy referencing legal frameworks (e.g., HIPAA, PCI-DSS, SOX compliance) must be explicitly marked for human review if changing or introducing new compliance clauses.
Removing or weakening any existing compliance requirement must trigger a review process.
Urgency & Priority:
If the document uses words like “urgent” or “immediately” to redefine operational processes without justification, it must be checked by a human approver.
Summary:
All changes that introduce new rules, increase financial thresholds, alter compliance terms, or suggest major operational changes require human review. Minor clarifications, rewording without altering rules, or adding examples that do not break these conditions can be auto-approved.
        `,
      },
    };
  },
});
