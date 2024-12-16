curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"fileId":"TEST_ID","fileName":"Contract.docx"}' \
  http://localhost:3000/api/docs/uploaded
{"success":true,"eventType":"doc.uploaded"}%