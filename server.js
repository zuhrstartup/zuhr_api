const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { google } = require('googleapis');

const port = Number(process.env.PORT || 3000);
const spreadsheetId = "1pO153AwrSgorWCGL4AVVZ-qOPAA7VRFTED04q3YpK3g";
const app = express();



app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

app.post('/api/preorders', async (req, res) => {
	const order = req.body;
	
	
	const fields = ['name', 'phone', 'job', 'color', 'qty', 'at'];
	if (!order || fields.some((field) => typeof order[field] !== 'string' || !order[field].trim())) {
		return res.status(400).json({ error: 'Missing required order data' });
	}
	
	 const auth = new google.auth.GoogleAuth({
    keyFile: "mainkey.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

     // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });


	try {
		await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
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
