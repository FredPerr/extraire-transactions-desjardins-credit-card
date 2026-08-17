chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    const [results] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const transactions = [];
        const panels = document.querySelectorAll("[id^='mobile-desc-trx']");

        panels.forEach((panel) => {
          let cardNumber = "";
          const cardElement = panel.querySelector("p strong");
          if (cardElement) {
            const cardMatch = cardElement.innerText.match(/(\d{4})\s*$/);
            if (cardMatch) cardNumber = cardMatch[1];
          }

          const table = panel.querySelector("table");
          if (!table) return;

          let currentDate = "";
          const rows = table.querySelectorAll("tbody tr");

          rows.forEach((row) => {
            const dateHeader = row.querySelector("th.sous-titre");
            if (dateHeader) {
              currentDate = dateHeader.innerText.trim();
              return;
            }

            const tds = row.querySelectorAll("td");
            if (tds.length >= 2) {
              const description = tds[0].innerText.replace(/\s+/g, " ").trim();
              const rawAmount = tds[1].innerText.replace(/\s+/g, " ").trim();

              const isCredit = rawAmount.includes("CR");
              const cleanAmount = rawAmount
                .replace("CR", "")
                .replace("$", "")
                .replace(/\s/g, "")
                .replace(",", ".");

              const debit = isCredit ? "" : cleanAmount;
              const credit = isCredit ? cleanAmount : "";

              if (description && cleanAmount) {
                transactions.push(`${currentDate}\t${description}\t${debit}\t${credit}\t${cardNumber}`);
              }
            }
          });
        });

        const resultText = transactions.join("\n");

        if (resultText) {
          navigator.clipboard.writeText(resultText);
          alert(`${transactions.length} transactions copiées dans le presse-papier !`);
        } else {
          alert("Aucune transaction trouvée sur la page.");
        }
      }
    });
  } catch (err) {
    console.error("Erreur lors de l'extraction :", err);
  }
});