# Manual Vercel Upload

Upload this entire `vercel-upload` folder to your existing Vercel project using the dashboard's folder upload/drop option.

Before deploying, open the Vercel project settings and add the `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable. Paste the full contents of your Google service-account JSON key as its value, select the Production environment, and save. Do not put the key file in this folder.

Make sure the Google Sheets API is enabled and the spreadsheet is shared with the service account's `client_email` as an editor. Then deploy the folder and test the site and preorder form.