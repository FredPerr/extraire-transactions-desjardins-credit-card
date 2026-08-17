function extractDOMTransactions() {
	const transactions = [];
	const tables = document.querySelectorAll(
		"#desktop-tableau-transactions-carte, #mobile-tableau-transactions-carte"
	);

	tables.forEach((table) => {
		let cardNumber = "";
		const panel = table.closest(".panel-body");
		if (panel) {
			const cardElement = panel.querySelector("p strong");
			if (cardElement) {
				const cardMatch = cardElement.innerText.match(/(\d{4})\s*$/);
				if (cardMatch) cardNumber = cardMatch[1];
			}
		}

		const rows = table.querySelectorAll("tbody tr");
		let currentDate = "";

		rows.forEach((row) => {
			const dateHeader = row.querySelector("th.sous-titre");
			if (dateHeader) {
				currentDate = dateHeader.innerText.trim();
				return;
			}

			const tds = row.querySelectorAll("td");

			let date = "";
			let description = "";
			let rawAmount = "";

			if (tds.length >= 3) {
				date = tds[0].innerText.replace(/\s+/g, " ").trim();
				description = tds[1].innerText.replace(/\s+/g, " ").trim();
				rawAmount = tds[2].innerText.replace(/\s+/g, " ").trim();
			} else if (tds.length >= 2) {
				date = currentDate;
				description = tds[0].innerText.replace(/\s+/g, " ").trim();
				rawAmount = tds[1].innerText.replace(/\s+/g, " ").trim();
			} else {
				return;
			}

			const isCredit = rawAmount.includes("CR");
			const cleanAmount = rawAmount
				.replace("CR", "")
				.replace("$", "")
				.replace(/\s/g, "");

			const debit = isCredit ? "" : cleanAmount;
			const credit = isCredit ? cleanAmount : "";

			if (description && cleanAmount) {
				transactions.push(`${date}\t${description}\t${debit}\t${credit}\t${cardNumber}`);
			}
		});
	});

	return transactions.join("\n");
}
