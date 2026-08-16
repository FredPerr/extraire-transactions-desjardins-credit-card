export function parsePDFText(rawText) {
  const transactions = [];
  
  const pattern = /^(\d{2}\s\d{2})\s+(\d{2}\s\d{2})\s+(.*?)(?:\s+(\d+,\d+\s*%))?\s+([\d\s]+,\d{2})(CR)?$/gm;
  
  let match;
  while ((match = pattern.exec(rawText)) !== null) {
    const [_, dateTrans, dateInscr, desc, reward, amount, isCredit] = match;
    
    let cleanAmount = amount.replace(/\s/g, '').replace(',', '.');
    if (isCredit) {
      cleanAmount = `-${cleanAmount}`;
    }

    transactions.push(`${dateTrans}\t${desc.trim()}\t${cleanAmount}`);
  }

  return transactions.join('\n');
}