export function parsePDFText(rawText) {
  const transactions = [];
  const cardPattern = /se terminant par\s+(\d{4})/gi;
  const transactionPattern = /^(\d{2}\s\d{2})\s+(\d{2}\s\d{2})\s+(.*?)(?:\s+(\d+,\d+\s*%))?\s+([\d\s]+,\d{2})(CR)?$/gm;

  const lines = rawText.split('\n');
  let currentCard = '';

  for (const line of lines) {
    const cardMatch = line.match(/se terminant par\s+(\d{4})/i);
    if (cardMatch) {
      currentCard = cardMatch[1];
    }

    transactionPattern.lastIndex = 0;
    const match = transactionPattern.exec(line);
    if (match) {
      const [_, dateTrans, dateInscr, description, reward, amount, isCredit] = match;

      const cleanAmount = amount.replace(/\s/g, '').replace(',', '.');
      const debit = isCredit ? '' : cleanAmount;
      const credit = isCredit ? cleanAmount : '';

      transactions.push(`${dateTrans}\t${description.trim()}\t${debit}\t${credit}\t${currentCard}`);
    }
  }

  return transactions.join('\n');
}