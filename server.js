const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const port = Number(process.env.PORT || 3000);
const scriptUrl = process.env.GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbz1D8Ru3IPUdPzXmvElVC8a2giAcnhQXmOpW6_ccu1_F-PzgP9UJ8TqLG9TKTQPeALNPA/exec";
const app = express();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.NOTIFY_EMAIL || 'zuhr.startup@gmail.com',
		pass: process.env.EMAIL_PASS || 'vkwv spjc vtbw hpyo',
	},
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

app.post('/api/preorders', async (req, res) => {
	const order = req.body;
	const fields = ['name', 'phone', 'job', 'color', 'qty', 'at'];
	if (!order || fields.some((field) => typeof order[field] !== 'string' || !order[field].trim())) {
		return res.status(400).json({ error: 'Missing required order data' });
	}

	// حفظ في جوجل شيت عبر Apps Script
	try {
		await fetch(scriptUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(order),
		});
	} catch (sheetErr) {
		console.error('Google Sheets sync error:', sheetErr.message);
	}

	// إرسال إشعار فوري على الإيميل
	try {
		await transporter.sendMail({
			from: '"ZUHR System" <zuhr.startup@gmail.com>',
			to: process.env.NOTIFY_EMAIL || 'zuhr.startup@gmail.com',
			subject: `طلب حجز جديد: ${order.name}`,
			text: `تم استلام طلب حجز جديد:\n\nالاسم: ${order.name}\nالموبايل: ${order.phone}\nالوظيفة: ${order.job}\nاللون: ${order.color}\nالكمية: ${order.qty}\nالتاريخ: ${order.at}`,
		});
	} catch (mailErr) {
		console.error('Email notification error:', mailErr.message);
	}

	res.json({ ok: true });
});

if (require.main === module) {
	app.listen(port, () => console.log(`Preorder backend listening on port ${port}`));
}

module.exports = app;
