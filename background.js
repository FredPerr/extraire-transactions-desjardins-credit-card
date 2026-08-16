import * as pdfjsLib from './pdf.mjs';
import { parsePDFText } from './parser.js';

// Configuration explicite du Worker avec l'URL de l'extension
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.mjs');

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) return;

  try {
    let arrayBuffer;

    // Si c'est un fichier local file://, on passe par le contexte de la page pour lire les octets
    if (tab.url.startsWith('file://')) {
      const [results] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const res = await fetch(window.location.href);
          const buf = await res.arrayBuffer();
          return Array.from(new Uint8Array(buf));
        }
      });
      arrayBuffer = new Uint8Array(results.result).buffer;
    } else {
      const response = await fetch(tab.url);
      arrayBuffer = await response.arrayBuffer();
    }

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableFontFace: true
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      
      const pageStrings = content.items.map(item => item.str);
      fullText += pageStrings.join(" ") + "\n";
    }

    const resultText = parsePDFText(fullText);

    if (!resultText) {
      console.warn("No transactions found.");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (textToCopy) => {
        navigator.clipboard.writeText(textToCopy);
        alert("Transactions copied to clipboard!");
      },
      args: [resultText]
    });

  } catch (err) {
    console.error("Failed to parse PDF:", err);
  }
});