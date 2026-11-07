const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { google } = require('googleapis');

const port = Number(process.env.PORT || 3000);
const sheetId = process.env.GOOGLE_SHEET_ID || "1fIKI64zP99ZN4IOhlAogu2Qv2Hx-meAgITaOeLNH0GU";
const app = express();

const credentialsPath = path.join(__dirname, 'credentials.json');
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
	? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
	: process.env.NODE_ENV !== 'production' && fs.existsSync(credentialsPath)
		? require(credentialsPath)
		: null;
const sheets = credentials?.client_email && credentials?.private_key
	? google.sheets({
		version: 'v4',
		auth: new google.auth.JWT({
			email: credentials.client_email,
			key: credentials.private_key,
			scopes: ['https://www.googleapis.com/auth/spreadsheets'],
		}),
	})
	: null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

app.post('/api/preorders', async (req, res) => {
	const order = req.body;
	const fields = ['name', 'phone', 'job', 'color', 'qty', 'at'];
	if (!order || fields.some((field) => typeof order[field] !== 'string' || !order[field].trim())) {
		return res.status(400).json({ error: 'Missing required order data' });
	}
	if (!sheetId || !sheets) {
		return res.status(503).json({ error: 'Google Sheets is not configured' });
	}

	try {
		await sheets.spreadsheets.values.append({
			spreadsheetId: sheetId,
			range: 'A:F',
			valueInputOption: 'RAW',
			insertDataOption: 'INSERT_ROWS',
			requestBody: {
				values: [[order.name, order.phone, order.job, order.color, order.qty, order.at]],
			},
		});

		res.json({ ok: true });
	} catch (error) {
		console.error('Could not save preorder:', error.message);
		res.status(500).json({ error: 'Could not save preorder' });
	}
});

app.listen(port, () => console.log(`Preorder backend listening on port ${port}`));
