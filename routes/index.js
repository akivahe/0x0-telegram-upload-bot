const express = require('express');
const router = express.Router();
const TelegramBot = require('telegrambot');
const tgToken = '<YOUR_TOKEN>'
const api = new TelegramBot(tgToken);
const Transfer = require('transfer-sh');
const path = require('path');
const fs = require('fs');
const download = require('download-file');
const dlPath = path.join(`${__dirname}`, '../downloads/');
const curl = new (require('curl-request'))();
const { exec } = require('child_process');



const allowedIds = [ARRAY_OF_TG_IDS];

/* GET home page. */
router.get('/', function (req, res, next) {
	res.send('get out');
});

router.post('/', async (req, res) => {
	var chatId = req.body.message.from.id;

	if (!allowedIds.includes(req.body.message.from.id) || req.body.message.text || req.body.message.sticker) {
		return res.json({});
	}

	var assetId = '';

	if (req.body.message.photo) {assetId = req.body.message.photo[req.body.message.photo.length-1].file_id;}
	if (req.body.message.video) {assetId = req.body.message.video.file_id;}
	if (req.body.message.document) {assetId = req.body.message.document.file_id;}

	api.getFile({ file_id: assetId }, async (fileErr, fileData) => {

		if (fileErr) {
			console.log(fileErr);
			return sendMessage(chatId, `Error: ${fileErr}`, res);
		}

		exec(`curl -F'url=https://api.telegram.org/file/bot${tgToken}/${fileData.file_path}' http://0x0.st`, (cmerr, stdout, stderr) => {
			if (cmerr) {
				console.log(cmerr);
				return sendMessage(chatId, `Error: ${fileErr}`, res);
			}

			return sendMessage(chatId, stdout, res);
		});
	});
});

function sendMessage(id, text, res) {
	api.sendMessage({ chat_id: id, text: text }, function (err, message) {
		if (err) { console.log(err); }
	});
	return res.json({});
}

module.exports = router;
